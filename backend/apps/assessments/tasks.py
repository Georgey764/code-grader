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

    test_cases = []

    for tc in test_case_objects:
        if is_file_input and tc.file_input:
            with tc.file_input.open("rb") as f:
                content = f.read().decode("utf-8") # This keeps \n as actual newlines
        else:
            content = tc.text_input

        test_cases.append(
            {
                "id": tc.id,
                "input": content,
                "expected_output": tc.expected_output,
            }
        )

    # 1. Safety check: Don't open if the file is massive (e.g., > 1MB)
    MAX_SIZE = 1024 * 14024  # 1 Megabyte
    if submission.submitted_file.size > MAX_SIZE:
        raise ValidationError("File too large to read into memory.")

    # 2. Open as binary for S3 compatibility
    try:
        with submission.submitted_file.open("rb") as f:
            student_code = f.read().decode("utf-8") # This keeps \n as actual newlines
    except Exception as e:
        # Handle potential network timeouts or S3 connection issues
        student_code = f"Error reading file: {e}"

    # Execution
    submission.update_test_status(status=Submission.Status.PROCESSING)

    if language == Assignment.Language.PYTHON:
        results = run_untrusted_python(student_code, test_cases, is_file_input)
    if language == Assignment.Language.JAVA:
        results = run_untrusted_java(student_code, test_cases, is_file_input)

    TestResult.save_test_results(submission, results)
    submission.update_test_status(status=Submission.Status.PROCESSED)

    return f"Processed submission: {submission_id}"
