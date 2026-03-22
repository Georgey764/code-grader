from rest_framework import viewsets, status, mixins
from django.utils import timezone
from apps.assignments.serializers import TestCaseSerializer
from .models import Assignment, RubricCriteria, TestCase, GroupsMembership, Group
from apps.assignments.serializers import (
    AssignmentSerializer,
    RubricCriteriaSerializer,
    GroupSerializer,
    GroupsMembershipSerializer,
)
from apps.assignments.permissions import (
    IsAssignmentAffiliated,
    IsAssignmentOwner,
    IsParentCoursesOwner,
    IsParentAssignmentOwner,
    IsParentAssignmentGrader,
    IsParentAssignmentAffiliated,
    IsGroupLeader,
)
from apps.core.permissions import DenyAll
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import Roles
from django.db.models import Q
from rest_framework.response import Response


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related(
        "course__faculty_profile__user",
    ).prefetch_related(
        "rubric_criterias",
        "test_cases",
        "groups",
        "submissions",
        "course__rosters__student_profile__user",
    )
    lookup_field = "id"
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.action == "retrieve":
            return [IsAssignmentAffiliated()]
        elif self.action in ["partial_update", "update", "destroy"]:
            return [IsAssignmentOwner()]
        elif self.action == "create":
            return [IsParentCoursesOwner()]
        elif self.action == "list":
            return [IsAuthenticated()]
        return [DenyAll()]

    def get_queryset(self):
        user = self.request.user

        role_filters = {
            Roles.STUDENT: "course__rosters__student_profile__user",
            Roles.FACULTY: "course__faculty_profile__user",
            Roles.GRADING_ASSISTANT: "course__grading_assistant_profile__user",
        }

        filter_path = role_filters.get(user.role)
        if not filter_path:
            return Assignment.objects.none()
        queryset = super().get_queryset().filter(**{filter_path: user})

        if self.action == "list":
            course_id = self.request.query_params.get("course_id")
            if not course_id:
                raise ValidationError(
                    {"course_id": "This query parameter is required."}
                )
            queryset = queryset.filter(course_id=course_id)

        filter_type = self.request.query_params.get("filter")

        available_filters = {
            "active": Q(deadline__gte=timezone.now()),
            "past": Q(deadline__lt=timezone.now()),
        }

        if filter_type in available_filters:
            queryset = queryset.filter(available_filters[filter_type])

        return queryset.order_by("-created_at")


class RubricViewSet(viewsets.ModelViewSet):
    queryset = RubricCriteria.objects.select_related("assignment").prefetch_related(
        "rubric_results"
    )
    serializer_class = RubricCriteriaSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsParentAssignmentOwner()]
        elif self.action == "list":
            return [IsAuthenticated()]
        elif self.action == "retrieve":
            return [IsParentAssignmentAffiliated()]
        return [DenyAll()]

    def get_queryset(self):
        """
        Optionally restricts the returned test cases to a given assignment,
        by filtering against an `assignment_id` query parameter in the URL.
        """
        queryset = super().get_queryset()

        user = self.request.user

        filter_paths = {
            Roles.GRADING_ASSISTANT: "assignment__course__grading_assistant_profile__user",
            Roles.FACULTY: "assignment__course__faculty_profile__user",
            Roles.STUDENT: "assignment__course__rosters__student_profile__user",
        }

        filter_path = filter_paths.get(user.role)
        if filter_path:
            queryset = queryset.filter(**{filter_path: user})
        else:
            return queryset.none()

        assignment_id = self.kwargs.get("assignment_id")
        if not assignment_id:
            raise ValidationError({"assignment_id": "This query path is required."})

        queryset = queryset.filter(assignment_id=assignment_id)

        return queryset


class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.select_related(
        "assignment__course__faculty_profile__user",
        "assignment__course__grading_assistant_profile__user",
    ).prefetch_related(
        "test_results",
    )
    serializer_class = TestCaseSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsParentAssignmentOwner()]
        elif self.action == "list":
            return [IsAuthenticated()]
        elif self.action == "retrieve":
            return [IsParentAssignmentGrader()]
        return [DenyAll()]

    def get_queryset(self):
        """
        Optionally restricts the returned test cases to a given assignment,
        by filtering against an `assignment_id` query parameter in the URL.
        """
        queryset = super().get_queryset()

        user = self.request.user

        filter_paths = {
            Roles.GRADING_ASSISTANT: "assignment__course__grading_assistant_profile__user",
            Roles.FACULTY: "assignment__course__faculty_profile__user",
            Roles.STUDENT: "assignment__course__rosters__student_profile__user",
        }
        filter_path = filter_paths.get(user.role)
        if filter_path:
            queryset = queryset.filter(**{filter_path: user})
        else:
            return queryset.none()

        if user.role == Roles.STUDENT:
            queryset = queryset.filter(is_hidden=False)

        assignment_id = self.kwargs.get("assignment_id")
        if not assignment_id:
            raise ValidationError({"assignment_id": "This query path is required."})

        queryset = queryset.filter(assignment_id=assignment_id)

        return queryset


class GroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing groups.
    """

    queryset = Group.objects.select_related(
        "assignment__course__faculty_profile__user"
    ).prefetch_related(
        "group_memberships__roster__student_profile__user",
    )
    serializer_class = GroupSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsParentAssignmentOwner()]
        elif self.action in [
            "update",
            "partial_update",
        ]:
            return [(IsParentAssignmentOwner | IsGroupLeader)()]
        elif self.action == "list":
            return [IsParentAssignmentGrader()]
        elif self.action == "retrieve":
            return [IsParentAssignmentAffiliated()]
        return [DenyAll()]

    def get_queryset(self):
        # Optional: Filter groups by assignment if passed in query params

        queryset = super().get_queryset()

        user = self.request.user

        filter_paths = {
            Roles.FACULTY: "assignment__course__faculty_profile__user",
            Roles.STUDENT: "assignment__course__rosters__student_profile__user",
        }
        filter_path = filter_paths.get(user.role)
        if filter_path:
            queryset = queryset.filter(**{filter_path: user})
        else:
            return queryset.none()

        assignment_id = self.kwargs.get("assignment_id")

        if not assignment_id:
            raise ValidationError(
                {"assignment_id": "URL Path requires assignment id for this endpoint"}
            )

        return queryset.filter(assignment_id=assignment_id)


class GroupsMembershipViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for managing student memberships in groups.
    """

    queryset = GroupsMembership.objects.all().select_related(
        "group__assignment__course__faculty_profile__user",
        "roster__student_profile__user",
    )
    serializer_class = GroupsMembershipSerializer
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        group_id = self.kwargs.get("group_id")
        assignment_id = self.kwargs.get("assignment_id")
        if group_id and assignment_id:
            return qs.filter(group_id=group_id, group__assignment_id=assignment_id)
        return qs.none()

    def get_permissions(self):
        if not self.request.user.is_authenticated:
            return [DenyAll()]
        if self.action in ["create", "destroy", "update", "partial_update"]:
            return [IsParentAssignmentOwner()]
        return [DenyAll()]

    def create(self, request, *args, **kwargs):
        """
        Custom create to enforce the max_members limit.
        """
        group_id = request.data.get("group")
        try:
            group = Group.objects.get(pk=group_id)
        except Group.DoesNotExist:
            return Response(
                {"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Business Logic: Check if group is full
        if group.group_memberships.count() >= group.max_members:
            return Response(
                {
                    "error": f"This group has reached its limit of {group.max_members} members."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().create(request, *args, **kwargs)
