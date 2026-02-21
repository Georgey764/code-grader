import time
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.assessments.models import Submission


@pytest.fixture(autouse=True)
def use_celery_always_eager(settings):
    settings.CELERY_TASK_ALWAYS_EAGER = True
    settings.CELERY_TASK_EAGER_PROPAGATES = True


@pytest.mark.django_db
def test_submission_lifecycle_end_to_end(
    student_client, assignment, roster, assessment_urls
):
    code_str = "a=int(input())\nb=int(input())\nprint(a+b)"

    mock_file = SimpleUploadedFile(
        name="solution.py",
        content=code_str.encode("utf-8"),
        content_type="text/x-python",
    )

    submit_code_url = assessment_urls.submissions_list
    payload = {
        "roster": roster.pk,
        "assignment": assignment.pk,
        "submitted_file": mock_file,
    }
    submit_code_response = student_client.post(
        submit_code_url, data=payload, format="multipart"
    )

    assert submit_code_response.status_code == 201

    run_tests_url = assessment_urls.submission_run_tests(
        submission_id=submit_code_response.data.get("id", None)
    )
    run_tests_response = student_client.post(run_tests_url)

    assert run_tests_response.status_code == 202

    poll_submission_status_url = assessment_urls.submission_detail(
        submission_id=submit_code_response.data.get("id")
    )

    retries = 2
    sleep = 2
    for i in range(retries):
        poll_submission_response = student_client.get(poll_submission_status_url)
        if (
            poll_submission_response.data.get("status", "PENDING")
            == Submission.Status.COMPLETE
        ):
            is_complete = True
            break
        else:
            is_complete = False
        time.sleep(sleep)

    assert is_complete
