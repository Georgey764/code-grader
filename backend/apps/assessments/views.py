from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.assessments.models import Submission, RubricResult, TestResult
from apps.assessments.serializers import (
    SubmissionSerializer,
    RubricResultSerializer,
    TestResultSerializer,
)
from apps.assessments.services import run_untrusted_python
from apps.assessments.tasks import run_submission_tests_task
from apps.assignments.models import TestCase
from rest_framework.exceptions import APIException


class SubmissionViewSet(viewsets.ModelViewSet):
    """
    Handles student file uploads and listing submissions.
    """

    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    @action(detail=True, methods=["post"], url_path="run-tests", url_name="run-tests")
    def run_tests(self, request, pk=None):
        """
        Custom endpoint to trigger the autograder for a specific submission.
        Accessible at: POST /api/submissions/{id}/run_tests/
        """
        submission = self.get_object()

        if not submission.submitted_file:
            return Response({"error": "No file attached"}, status=400)

        run_submission_tests_task.delay(submission.id)

        return Response(
            {"status": "Tests triggered", "submission_id": submission.id},
            status=status.HTTP_202_ACCEPTED,
        )


class RubricResultViewSet(viewsets.ModelViewSet):
    """
    Handles manual grading entries by faculty.
    """

    queryset = RubricResult.objects.all()
    serializer_class = RubricResultSerializer

    def get_queryset(self):
        # Optional: Filter results by submission via query params
        # e.g., /api/rubric-results/?submission_id=uuid
        queryset = super().get_queryset()
        submission_id = self.request.query_params.get("submission_id")
        if submission_id:
            queryset = queryset.filter(submission_id=submission_id)
        return queryset


class TestResultViewSet(viewsets.ModelViewSet):
    queryset = TestResult.objects.all()
    serializer_class = TestResultSerializer
