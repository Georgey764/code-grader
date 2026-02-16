from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Submission, RubricResult, TestResult
from .serializers import (
    SubmissionSerializer,
    RubricResultSerializer,
    TestResultSerializer,
)


class SubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing submissions.
    Automatically handles nested Rubric and Test results.
    """

    serializer_class = SubmissionSerializer

    # Filtering and Searching
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["assignment", "roster", "group"]
    search_fields = [
        "code_submitted",
        "roster__user__username",
    ]  # Assuming Roster links to User

    def get_queryset(self):
        """
        Optimized queryset to prevent N+1 queries by pre-fetching
        the related results and joining the assignment/roster metadata.
        """
        return (
            Submission.objects.all()
            .select_related("assignment", "roster")
            .prefetch_related(
                "rubric_results", "test_results", "test_results__test_case"
            )
        )


class RubricResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A read-only view for individual rubric results.
    Usually accessed via the Submission, but useful for aggregate reporting.
    """

    queryset = RubricResult.objects.all()
    serializer_class = RubricResultSerializer
    filterset_fields = ["submission", "rubric_criteria"]


class TestResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A read-only view for individual test results.
    """

    queryset = TestResult.objects.all()
    serializer_class = TestResultSerializer
    filterset_fields = ["submission", "test_case", "status"]
