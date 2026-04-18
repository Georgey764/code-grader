"""
Faculty-only endpoints for the static ML heuristic in ai_service.
"""

from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assessments.models import Submission
from apps.assessments.submission_payload import parse_submission_payload
from apps.core.permissions import IsFaculty

from apps.ai_detector.ai_service import predict_ai_generated_detail

_MAX_CODE_CHARS = 200_000


def _extract_code_text(submitted_file: str | None) -> str:
    raw = (submitted_file or "").strip()
    if not raw:
        return ""
    try:
        payload = parse_submission_payload(submitted_file)
    except ValueError:
        return raw[:_MAX_CODE_CHARS]

    if payload["mode"] == "single":
        return (payload.get("content") or "")[:_MAX_CODE_CHARS]

    parts: list[str] = []
    for name in sorted(payload.get("files", {}).keys()):
        body = payload["files"][name]
        parts.append(f"# --- {name} ---\n{body}")
    text = "\n\n".join(parts)
    return text[:_MAX_CODE_CHARS]


class SubmissionAiAnalyzeView(APIView):
    """
    POST: run the bundled classifier on a submission's source (faculty course owner only).
    """

    permission_classes = [IsAuthenticated, IsFaculty]

    def post(self, request, submission_id):
        submission = get_object_or_404(
            Submission.objects.select_related(
                "assignment__course__faculty_profile__user",
            ),
            pk=submission_id,
        )
        course = submission.assignment.course
        try:
            if course.faculty_profile.user_id != request.user.id:
                return Response(
                    {"detail": "Not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        except AttributeError:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        text = _extract_code_text(submission.submitted_file)
        detail = predict_ai_generated_detail(text)

        return Response(
            {
                "submission_id": str(submission.id),
                "prediction": detail["prediction"],
                "confidence_percent": detail["confidence_percent"],
                "summary": detail["summary"],
                "analyzed_characters": len(text),
            },
            status=status.HTTP_200_OK,
        )
