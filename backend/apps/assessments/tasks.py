from celery import shared_task
from apps.assessments.models import Submission, TestResult
from apps.assessments.services import run_untrusted_python, run_untrusted_java
from apps.assignments.models import Assignment, TestCase


def run_submission_tests_sync(submission: Submission) -> None:
    """
    Load test cases, execute student code, persist TestResult rows.
    Clears any prior test results for this submission (e.g. re-runs).
    """
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

    submission.update_test_status(status=Submission.Status.PROCESSING)

    submission.test_results.all().delete()

    try:
        if language == Assignment.Language.PYTHON:
            results = run_untrusted_python(student_code, test_cases, is_file_input)
        elif language == Assignment.Language.JAVA:
            results = run_untrusted_java(student_code, test_cases, is_file_input)
        else:
            results = []

        TestResult.save_test_results(submission, results)
    finally:
        submission.update_test_status(status=Submission.Status.PROCESSED)


@shared_task
def run_submission_tests_task(submission_id):
    try:
        submission = Submission.objects.get(pk=submission_id)
    except Submission.DoesNotExist:
        return f"Submission {submission_id} not found."

    try:
        run_submission_tests_sync(submission)
    except Exception as e:
        raise e
    return f"Submission {submission_id} processed."
