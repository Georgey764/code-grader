from rest_framework import viewsets, mixins
from django.db.models import Prefetch

from apps.assessments.models import PlagiarismMatch, Submission
from apps.courses.models import Course, Roster
from apps.courses.serializers import (
    CourseSerializer,
    GradebookSubmissionSerializer,
    RosterSerializer,
)
from apps.core.permissions import IsFaculty, DenyAll, IsStudent
from apps.courses.permissions import IsCourseOwner, IsCourseAffiliated, IsRosterOwner
from apps.accounts.models import Roles, FacultyProfile, StudentProfile
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action


class CourseModelViewset(viewsets.ModelViewSet):
    queryset = Course.objects.select_related(
        "faculty_profile__user",
        "grading_assistant_profile__user",
    ).prefetch_related("rosters")
    serializer_class = CourseSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ["create"]:
            return [IsFaculty()]
        elif self.action in ["destroy", "partial_update", "update"]:
            return [IsCourseOwner()]
        elif self.action == "retrieve":
            return [IsCourseAffiliated()]
        elif self.action == "list":
            return [IsAuthenticated()]
        elif self.action == "grades":
            return [IsCourseOwner()]
        else:
            return [DenyAll()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.role == Roles.FACULTY:
            return queryset.filter(faculty_profile__user=user)
        elif user.role == Roles.STUDENT:
            return queryset.filter(rosters__student_profile__user=user)
        elif user.role == Roles.GRADING_ASSISTANT:
            return queryset.filter(grading_assistant_profile__user=user)

        return Course.objects.none()

    def create(self, request, *args, **kwargs):
        faculty_profile_instance = FacultyProfile.objects.filter(
            user=request.user
        ).first()

        if not faculty_profile_instance:
            return Response(
                {"error": "Only faculties can create"}, status=status.HTTP_404_NOT_FOUND
            )

        body_data = request.data
        serializer = self.get_serializer(data=body_data)
        serializer.is_valid(raise_exception=True)
        serializer.save(faculty_profile=faculty_profile_instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="grades")
    def grades(self, request, *args, **kwargs):
        course = self.get_object()
        # We prefetch rubric_criterias so the count() call in the serializer
        # doesn't hit the DB repeatedly
        assignments = course.assignments.prefetch_related("rubric_criterias").all()
        grade_data = []

        for assignment in assignments:
            assignment_info = {
                "assignment_id": assignment.id,
                "assignment_name": assignment.name,
                "is_grouped": assignment.is_grouped,
                "is_weighted": assignment.is_weighted,
                "data": [],
            }

            # Determine entities (Groups vs Rosters)
            if assignment.is_grouped:
                entities = assignment.course.groups.all()
            else:
                entities = assignment.course.rosters.select_related(
                    "student_profile__user"
                ).all()

            for entity in entities:
                filter_kwargs = {"assignment": assignment}
                student_info = None

                if assignment.is_grouped:
                    filter_kwargs["group"] = entity
                else:
                    filter_kwargs["roster"] = entity
                    profile = entity.student_profile
                    student_info = {
                        "id": profile.id,
                        "full_name": profile.user.get_full_name(),
                        "email": profile.user.email,
                    }

                # Fetch latest submission
                latest_sub = (
                    Submission.objects.filter(**filter_kwargs)
                    .select_related("roster__student_profile__user")
                    .prefetch_related(
                        "rubric_results__rubric_criteria",
                        "test_results",
                        Prefetch(
                            "plagiarism_matches_as_a",
                            queryset=PlagiarismMatch.objects.select_related(
                                "submission_b__roster__student_profile__user"
                            ),
                        ),
                        Prefetch(
                            "plagiarism_matches_as_b",
                            queryset=PlagiarismMatch.objects.select_related(
                                "submission_a__roster__student_profile__user"
                            ),
                        ),
                    )
                    .order_by("-created_at")
                    .first()
                )

                assignment_info["data"].append(
                    {
                        "entity_id": entity.id,
                        "entity_name": str(entity),
                        "student_detail": student_info,
                        "submission": GradebookSubmissionSerializer(latest_sub).data
                        if latest_sub
                        else None,
                    }
                )

            grade_data.append(assignment_info)

        return Response(grade_data, status=status.HTTP_200_OK)


class RosterModelViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Roster.objects.select_related(
        "course", "student_profile__user"
    ).prefetch_related("course__assignments")
    serializer_class = RosterSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ["destroy"]:
            return [(IsFaculty & IsRosterOwner)()]
        elif self.action == "create":
            return [(IsStudent | IsFaculty)()]
        elif self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        elif self.action == "leave_course":
            return [(IsStudent & IsRosterOwner)()]
        return [DenyAll()]

    def get_queryset(self):
        user = self.request.user

        course_id = self.kwargs.get("course_id")
        assignment_id = self.request.GET.get("assignment_id")

        queryset = super().get_queryset().filter(course_id=course_id)

        if assignment_id:
            queryset.filter(course__assignments__id=assignment_id)

        if user.role == Roles.STUDENT:
            return queryset.filter(student_profile__user=user)

        if user.role == Roles.FACULTY:
            return queryset.filter(course__faculty_profile__user=user)

        if user.role == Roles.GRADING_ASSISTANT:
            return queryset.filter(course__grading_assistant_profile__user=user)

        return queryset.none()

    def perform_create(self, serializer):
        course_id = self.kwargs.get("course_id")
        cwid = self.request.GET.get("cwid")
        user = self.request.user

        if not course_id:
            raise serializers.ValidationError("course_id is required in URL")
        enrolling_course = get_object_or_404(Course, pk=course_id)

        if user.role == Roles.FACULTY:
            try:
                if enrolling_course.faculty_profile.user != user:
                    raise ValidationError("Error validating faculty ownership")
            except AttributeError:
                raise ValidationError("Error validating faculty ownership")

            if not cwid:
                raise ValidationError({"cwid": "This search param is required"})

            student_profile = get_object_or_404(StudentProfile, user__cwid=cwid)
        else:
            student_profile = get_object_or_404(StudentProfile, user=self.request.user)

        if Roster.objects.filter(
            course=enrolling_course, student_profile=student_profile
        ).exists():
            raise ValidationError("Student is already enrolled in this course.")

        serializer.save(course=enrolling_course, student_profile=student_profile)

    @action(detail=False, methods=["delete"], url_path="me")
    def leave_course(self, request, course_pk=None):
        """
        Endpoint: DELETE /courses/<uuid:course_pk>/roster/unenroll/
        Allows a student to unenroll themselves.
        """
        # Find the specific roster record for this user in this course
        instance = get_object_or_404(
            Roster, course_id=course_pk, student_profile__user=request.user
        )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
