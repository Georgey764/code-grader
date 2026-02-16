from rest_framework import generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Assignment, RubricCriteria, TestCase
from .serializers import (
    AssignmentSerializer,
    AssignmentDetailSerializer,
    AssignmentListSerializer,
    AssignmentCreateSerializer,
    RubricCriteriaSerializer,
    TestCaseSerializer,
)


# ============= Assignment Views =============


class AssignmentListView(generics.ListAPIView):
    """List all assignments, optionally filtered by course"""

    serializer_class = AssignmentListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Assignment.objects.select_related("course").prefetch_related(
            "rubrics", "test_cases"
        )

        # Filter by course if provided
        course_id = self.request.query_params.get("course_id")
        if course_id:
            queryset = queryset.filter(course_id=course_id)

        # Filter by active/past deadlines
        filter_type = self.request.query_params.get("filter")
        if filter_type == "active":
            queryset = queryset.filter(deadline__gte=timezone.now())
        elif filter_type == "past":
            queryset = queryset.filter(deadline__lt=timezone.now())

        return queryset.order_by("-created_at")


class AssignmentDetailView(generics.RetrieveAPIView):
    """Retrieve a single assignment with full details"""

    queryset = Assignment.objects.select_related("course").prefetch_related(
        "rubrics", "test_cases"
    )
    serializer_class = AssignmentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"


class AssignmentCreateView(generics.CreateAPIView):
    """Create a new assignment with optional rubrics and test cases"""

    queryset = Assignment.objects.all()
    serializer_class = AssignmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]  # Add instructor permission

    def perform_create(self, serializer):
        serializer.save()


class AssignmentUpdateView(generics.UpdateAPIView):
    """Update an existing assignment"""

    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]  # Add instructor permission
    lookup_field = "id"


class AssignmentDeleteView(generics.DestroyAPIView):
    """Delete an assignment"""

    queryset = Assignment.objects.all()
    permission_classes = [permissions.IsAuthenticated]  # Add instructor permission
    lookup_field = "id"


class AssignmentByCourseView(generics.ListAPIView):
    """Get all assignments for a specific course"""

    serializer_class = AssignmentListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get("course_id")
        return (
            Assignment.objects.filter(course_id=course_id)
            .select_related("course")
            .prefetch_related("rubrics", "test_cases")
            .order_by("deadline")
        )


# ============= RubricCriteria Views =============


class RubricCriteriaListCreateView(generics.ListCreateAPIView):
    """List and create rubric criteria for an assignment"""

    serializer_class = RubricCriteriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        assignment_id = self.kwargs.get("assignment_id")
        return RubricCriteria.objects.filter(assignment_id=assignment_id)

    def perform_create(self, serializer):
        assignment_id = self.kwargs.get("assignment_id")
        assignment = get_object_or_404(Assignment, id=assignment_id)
        serializer.save(assignment=assignment)


class RubricCriteriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a rubric criteria"""

    queryset = RubricCriteria.objects.all()
    serializer_class = RubricCriteriaSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"


# ============= TestCase Views =============


class TestCaseListCreateView(generics.ListCreateAPIView):
    """List and create test cases for an assignment"""

    serializer_class = TestCaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        assignment_id = self.kwargs.get("assignment_id")
        queryset = TestCase.objects.filter(assignment_id=assignment_id)

        # Filter public/private test cases
        is_public = self.request.query_params.get("is_public")
        if is_public is not None:
            queryset = queryset.filter(is_public=is_public.lower() == "true")

        return queryset

    def perform_create(self, serializer):
        assignment_id = self.kwargs.get("assignment_id")
        assignment = get_object_or_404(Assignment, id=assignment_id)
        serializer.save(assignment=assignment)


class TestCaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a test case"""

    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"


class PublicTestCasesView(generics.ListAPIView):
    """Get only public test cases for students"""

    serializer_class = TestCaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        assignment_id = self.kwargs.get("assignment_id")
        return TestCase.objects.filter(assignment_id=assignment_id, is_public=True)


# ============= Utility Views =============


class AssignmentStatsView(APIView):
    """Get statistics for an assignment"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, assignment_id):
        assignment = get_object_or_404(Assignment, id=assignment_id)

        stats = {
            "assignment_id": assignment_id,
            "assignment_name": assignment.name,
            "total_rubric_criteria": assignment.rubrics.count(),
            "total_test_cases": assignment.test_cases.count(),
            "public_test_cases": assignment.test_cases.filter(is_public=True).count(),
            "private_test_cases": assignment.test_cases.filter(is_public=False).count(),
            "max_points": assignment.max_points_allowed,
            "is_grouped": assignment.is_grouped,
            "deadline": assignment.deadline,
            "is_past_deadline": assignment.deadline < timezone.now(),
        }

        return Response(stats, status=status.HTTP_200_OK)


class CloneAssignmentView(APIView):
    """Clone an existing assignment to another course"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, assignment_id):
        original = get_object_or_404(Assignment, id=assignment_id)
        new_course_id = request.data.get("new_course_id")

        if not new_course_id:
            return Response(
                {"error": "new_course_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Clone assignment
        cloned = Assignment.objects.create(
            course_id=new_course_id,
            name=f"{original.name} (Copy)",
            description=original.description,
            deadline=original.deadline,
            starter_code=original.starter_code,
            max_points_allowed=original.max_points_allowed,
            is_grouped=original.is_grouped,
        )

        # Clone rubrics
        for rubric in original.rubrics.all():
            RubricCriteria.objects.create(
                assignment=cloned,
                name=rubric.name,
                description=rubric.description,
                max_points=rubric.max_points,
            )

        # Clone test cases
        for test_case in original.test_cases.all():
            TestCase.objects.create(
                assignment=cloned,
                input_data=test_case.input_data,
                expected_output=test_case.expected_output,
                is_public=test_case.is_public,
                weight=test_case.weight,
            )

        serializer = AssignmentDetailSerializer(cloned)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
