from celery import shared_task
from django.core.exceptions import ValidationError
from apps.assessments.models import Submission, TestResult
from apps.assessments.services import run_untrusted_python, run_untrusted_java
from apps.assignments.models import Assignment, TestCase


@shared_task
def run_submission_tests_task(submission_id):
    # Fetch the object inside the worker
    try:
        submission = Submission.objects.get(pk=submission_id)
    except Submission.DoesNotExist:
        return f"Submission {submission_id} not found."

    # Your logic (Copied from your View)
    assignment = submission.assignment
    language = assignment.language
    is_file_input = assignment.is_file_input
    test_case_objects = TestCase.objects.filter(assignment__pk=assignment.pk)
    student_code = submission.submitted_file

    test_cases = []

    for tc in test_case_objects:
        test_cases.append(
            {
                "id": tc.id,
                "input": tc.text_input,
                "expected_output": tc.expected_output,
            }
        )

    # Execution
    submission.update_test_status(status=Submission.Status.PROCESSING)

    try:
        if language == Assignment.Language.PYTHON:
            results = run_untrusted_python(student_code, test_cases, is_file_input)
        if language == Assignment.Language.JAVA:
            results = run_untrusted_java(student_code, test_cases, is_file_input)

        TestResult.save_test_results(submission, results)
        submission.update_test_status(status=Submission.Status.PROCESSED)

    except Exception as e:
        submission.update_test_status(status=Submission.Status.PROCESSED)
        raise e
