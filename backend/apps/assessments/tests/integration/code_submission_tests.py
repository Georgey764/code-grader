import pytest
import time
from pathlib import Path


@pytest.mark.django_db
class TestCodeSubmissions:
    """
    This class test is to ensure submission API work with cloud infra
    """

    def _get_latest_log_stream(self, logs_client, log_group, retries=5, wait=8):
        """Fetch the most recent log stream with retry."""
        for _ in range(retries):
            time.sleep(wait)
            streams = logs_client.describe_log_streams(
                logGroupName=log_group,
                orderBy="LastEventTime",
                descending=True,
                limit=1,
            )["logStreams"]

            if streams:
                return streams[0]["logStreamName"]
        raise RuntimeError("No log streams found in CloudWatch Logs")

    def _wait_for_log_message(
        self,
        start_time,
        logs_client,
        log_group,
        log_stream,
        message_substring,
        timeout=30,
    ):
        """Poll the log stream until a specific message appears or timeout."""
        start = time.time()
        while time.time() - start < timeout:
            events = logs_client.get_log_events(
                logGroupName=log_group,
                logStreamName=log_stream,
                # startTime=start_time,
                startFromHead=False,
            )["events"]

            messages = [e["message"] for e in events]
            if any(message_substring in m for m in messages):
                return True
            time.sleep(1)
        return False

    def test_s3_trigger_executes_lambda(self, s3_client, logs_client):
        bucket = "code-grader-storage"
        key = "workstation/submissions/test.py"

        test_start_time = int((time.time() - 600) * 1000)
        # 1. Upload file to trigger Lambda
        s3_client.put_object(Bucket=bucket, Key=key, Body="print('hello')")

        # 2. Get the latest log stream
        log_group = "/aws/lambda/student-code-runner"
        latest_stream = self._get_latest_log_stream(logs_client, log_group)

        # 3. Wait for the Lambda log to appear
        assert self._wait_for_log_message(
            test_start_time,
            logs_client,
            log_group,
            latest_stream,
            message_substring="Received S3 Event",
        )
        s3_client.delete_object(Bucket=bucket, Key=key)

    def test_submission_post(self, student_client, assessment_urls, roster, assignment):
        url = assessment_urls.submissions_list
        file_path = Path(__file__).parent / "../related_files/submitted_code.py"

        with open(file_path, "rb") as file:
            payload = {
                "roster": roster.id,
                "assignment": assignment.id,
                "submitted_file": ("submitted_code.py", file, "text/plain"),
            }
            response = student_client.post(url, data=payload, format="multipart")

        print(response)
        print(response.data)

        assert response.status_code == 201

    def test_submission_post_then_retrieve(
        self, student_client, assessment_urls, roster, assignment
    ):
        url = assessment_urls.submissions_list
        file_path = Path(__file__).parent / "../related_files/submitted_code.py"

        with open(file_path, "rb") as file:
            payload = {
                "roster": roster.id,
                "assignment": assignment.id,
                "submitted_file": ("submitted_code.py", file, "text/plain"),
            }
            response = student_client.post(url, data=payload, format="multipart")

        print(response)
        print(response.data)

        assert response.status_code == 201
