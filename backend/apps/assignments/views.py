from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Assignment, RubricCriteria, TestCase
from . import serializers


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related(
        "course__faculty_profile__user"
    ).prefetch_related("rubrics", "test_cases")
    lookup_field = "id"

    def get_serializer_class(self):
        if self.action == "list":
            return serializers.AssignmentListSerializer
        if self.action == "retrieve":
            return serializers.AssignmentDetailSerializer
        if self.action in ["create", "update", "partial_update"]:
            return serializers.AssignmentCreateSerializer
        return serializers.AssignmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        # Handle course filtering and deadline status via query params
        course_id = self.request.query_params.get("course_id")
        filter_type = self.request.query_params.get("filter")

        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if filter_type == "active":
            queryset = queryset.filter(deadline__gte=timezone.now())
        elif filter_type == "past":
            queryset = queryset.filter(deadline__lt=timezone.now())

        return queryset.order_by("-created_at")

    @action(detail=True, methods=["get"])
    def stats(self, request, id=None):
        assignment = self.get_object()
        return Response(
            {
                "total_rubric_criteria": assignment.rubrics.count(),
                "total_test_cases": assignment.test_cases.count(),
                "is_past_deadline": assignment.deadline < timezone.now(),
                # ... add other fields here
            }
        )

    @action(detail=True, methods=["post"])
    def clone(self, request, id=None):
        original = self.get_object()
        new_course_id = request.data.get("new_course_id")
        if not new_course_id:
            return Response({"error": "new_course_id required"}, status=400)

        # Logic for cloning (Keep your existing logic here)
        # ...
        return Response({"status": "cloned"}, status=201)


class RubricViewSet(viewsets.ModelViewSet):
    queryset = RubricCriteria.objects.all()
    serializer_class = serializers.RubricCriteriaSerializer
    lookup_field = "id"

    # def get_queryset(self):
    #     return self.queryset.filter(assignment_id=self.kwargs.get("assignment_id"))


class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = serializers.TestCaseSerializer
    lookup_field = "id"

    # def get_queryset(self):
    #     qs = self.queryset.filter(assignment_id=self.kwargs.get("assignment_id"))
    #     is_public = self.request.query_params.get("is_public")
    #     if is_public:
    #         qs = qs.filter(is_public=is_public.lower() == "true")
    #     return qs
