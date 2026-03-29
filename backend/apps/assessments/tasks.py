from celery import shared_task
from django.db.models import Q

from apps.assessments.models import PlagiarismMatch, Submission, TestResult
from apps.assessments.plagiarism_service import (
    SIMILARITY_THRESHOLD,
    ordered_submission_pair,
    structural_similarity_ratio,
)
from apps.assessments.services import run_untrusted_python, run_untrusted_java
from apps.assignments.models import Assignment, TestCase


@shared_task
def run_submission_tests_task(submission_id):
    # Fetch the object inside the worker
    try:
        submission = Submission.objects.get(pk=submission_id)
    except Submission.DoesNotExist:
        return f"Submission {submission_id} not found."

    assignment = submission.assignment
    language = assignment.language
    is_file_input = assignment.is_file_input
    test_case_objects = TestCase.objects.filter(assignment__pk=assignment.pk)
    student_code = submission.submitted_file

    test_cases = []
    for tc in test_case_objects:
        test_cases.append({
            "id": tc.id,
            "input": tc.text_input,
            "expected_output": tc.expected_output,
        })

    # Set status to PROCESSING
    submission.status = Submission.Status.PROCESSING
    submission.save()

    try:
        results = []
        if language == Assignment.Language.PYTHON:
            results = run_untrusted_python(student_code, test_cases, is_file_input)
        elif language == Assignment.Language.JAVA:
            results = run_untrusted_java(student_code, test_cases, is_file_input)

        TestResult.save_test_results(submission, results)
        
        # Set status to PROCESSED on success
        submission.status = Submission.Status.PROCESSED
        submission.save()
        return f"Processed submission: {submission_id}"

    except Exception as e:
        # Ensure status is reset even if execution fails
        submission.status = Submission.Status.PROCESSED
        submission.save()
        raise e


@shared_task
def run_plagiarism_check_task(submission_id):
    try:
        submission = Submission.objects.select_related("assignment").get(pk=submission_id)
    except Submission.DoesNotExist:
        return f"Plagiarism: submission {submission_id} not found."

    assignment = submission.assignment
    if assignment.language != Assignment.Language.PYTHON:
        return "Plagiarism: skipped (non-Python assignment)."

    code = submission.submitted_file or ""
    if len(code.strip()) < 50:
        return "Plagiarism: skipped (source too short)."

    PlagiarismMatch.objects.filter(
        Q(submission_a=submission) | Q(submission_b=submission)
    ).delete()

    others = Submission.objects.filter(assignment=assignment).exclude(pk=submission.pk)
    created = 0
    for other in others.iterator():
        other_code = other.submitted_file or ""
        ratio = structural_similarity_ratio(code, other_code)
        if ratio <= SIMILARITY_THRESHOLD:
            continue
        a, b = ordered_submission_pair(submission, other)
        PlagiarismMatch.objects.update_or_create(
            submission_a=a,
            submission_b=b,
            defaults={"similarity_score": ratio},
        )
        created += 1

    return f"Plagiarism: {created} match(es) for submission {submission_id}."