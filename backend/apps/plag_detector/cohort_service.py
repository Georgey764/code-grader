"""
Compare one submission against other students' submissions only (same student_profile
excluded — no self-comparison across attempts/sections) in the cohort: same course
short_name, assignment name, language, and faculty owner.
"""

from __future__ import annotations

from django.db.models import QuerySet

from apps.assignments.models import Assignment
from apps.assessments.models import Submission
from apps.plag_detector.detector.fingerprint import winnow
from apps.plag_detector.detector.line_highlights import highlight_lines_from_shared_kgrams
from apps.plag_detector.detector.similarity import compute_similarity
from apps.plag_detector.detector.tokenizer_lines import tokenize_source_with_lines
from apps.plag_detector.text_extract import source_as_lines, submission_to_text

# Minimum combined score (0–100) to include in results
MIN_REPORT_SCORE = 35.0
KGRAM = 5
WINNOW_W = 4


def _peer_assignments(assignment: Assignment) -> QuerySet[Assignment]:
    """
    Same assignment title + language across sections that share this course's short_name
    and are owned by the same faculty (avoids leaking submissions across instructors).
    """
    course = assignment.course
    short = (course.short_name or "").strip()
    return Assignment.objects.filter(
        course__short_name__iexact=short,
        course__faculty_profile_id=course.faculty_profile_id,
        name=assignment.name,
        language=assignment.language,
    ).select_related("course")


def _student_label(sub: Submission) -> str:
    try:
        u = sub.roster.student_profile.user
        return f"{u.first_name or ''} {u.last_name or ''}".strip() or u.email or "Student"
    except Exception:
        return "Student"


def _course_label(sub: Submission) -> str:
    try:
        c = sub.assignment.course
        return f"{c.name} (CRN {c.crn})"
    except Exception:
        return ""


def compare_cohort_for_submission(
    submission: Submission,
    *,
    max_peers: int = 200,
) -> dict:
    """
    Build API payload: similarity + line-level highlights for each peer above MIN_REPORT_SCORE.
    """
    assignment = submission.assignment
    lang = assignment.language or "python"

    text_self = submission_to_text(submission.submitted_file)
    lines_self = source_as_lines(text_self)
    if not text_self.strip():
        return {
            "short_name": assignment.course.short_name,
            "assignment_name": assignment.name,
            "language": lang,
            "peers_compared": 0,
            "query_submission_id": str(submission.id),
            "query_lines": lines_self,
            "query_highlight_lines": [],
            "matches": [],
            "message": "No source text in this submission.",
        }

    t_self = tokenize_source_with_lines(text_self, lang)
    if len(t_self) < KGRAM:
        return {
            "short_name": assignment.course.short_name,
            "assignment_name": assignment.name,
            "language": lang,
            "peers_compared": 0,
            "query_submission_id": str(submission.id),
            "query_lines": lines_self,
            "query_highlight_lines": [],
            "matches": [],
            "message": "Submission too short to analyze.",
        }

    tok_only_self = [x[0] for x in t_self]
    fp_self = winnow(tok_only_self, k=KGRAM, w=WINNOW_W)

    peer_ids = list(
        _peer_assignments(assignment).values_list("id", flat=True),
    )
    my_student_profile_id = submission.roster.student_profile_id
    peers_qs = (
        Submission.objects.filter(assignment_id__in=peer_ids)
        .exclude(pk=submission.pk)
        .exclude(roster__student_profile_id=my_student_profile_id)
        .select_related("assignment__course", "roster__student_profile__user")
        .order_by("created_at")[:max_peers]
    )

    matches: list[dict] = []
    compared = 0

    for peer in peers_qs:
        compared += 1
        text_peer = submission_to_text(peer.submitted_file)
        if not text_peer.strip():
            continue

        t_peer = tokenize_source_with_lines(text_peer, lang)
        if len(t_peer) < KGRAM:
            continue

        tok_peer = [x[0] for x in t_peer]
        fp_peer = winnow(tok_peer, k=KGRAM, w=WINNOW_W)
        sim = compute_similarity(fp_self, fp_peer, tok_only_self, tok_peer)

        if sim.score < MIN_REPORT_SCORE:
            continue

        hi_self, hi_peer = highlight_lines_from_shared_kgrams(
            t_self, t_peer, k=KGRAM
        )
        lines_peer = source_as_lines(text_peer)

        created = peer.created_at
        matches.append(
            {
                "peer_submission_id": str(peer.id),
                "peer_submitted_at": created.isoformat() if created else None,
                "student_display": _student_label(peer),
                "course_display": _course_label(peer),
                "score": sim.score,
                "verdict": sim.verdict,
                "jaccard": sim.jaccard,
                "token_overlap": sim.token_overlap,
                "shared_fingerprints": sim.shared_fingerprints,
                "query_highlight_lines": sorted(hi_self),
                "other_lines": lines_peer,
                "other_highlight_lines": sorted(hi_peer),
            }
        )

    matches.sort(key=lambda m: m["score"], reverse=True)

    # Union of all query lines flagged in any match (for summary strip)
    union_query: set[int] = set()
    for m in matches:
        union_query.update(m["query_highlight_lines"])

    return {
        "short_name": assignment.course.short_name,
        "assignment_name": assignment.name,
        "language": lang,
        "peers_compared": compared,
        "query_submission_id": str(submission.id),
        "query_lines": lines_self,
        "query_highlight_lines": sorted(union_query),
        "matches": matches,
        "message": None,
    }
