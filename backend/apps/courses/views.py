from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.courses.models import Course, Roster
from apps.courses.serializers import CourseSerializer, RosterSerializer
from apps.core.permissions import Is_Faculty, DenyAll
from apps.courses.permissions import Is_Course_Owner
from apps.accounts.models import Roles, FacultyProfile, StudentProfile
from rest_framework import status
from rest_framework.response import Response
from apps.core.permissions import Is_Student, Is_Faculty
from apps.courses.permissions import (
    Is_Course_Affiliated,
    IsEnrolledStudent,
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError


class CourseModelViewset(viewsets.ModelViewSet):
    queryset = Course.objects.select_related("faculty_profile__user").prefetch_related(
        "assignments"
    )
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [Is_Faculty()]
        elif self.action in ["destroy", "partial_update", "update"]:
            return [Is_Course_Owner()]
        elif self.action in ["retrieve", "list"]:
            return [Is_Course_Affiliated()]
        else:
            return [DenyAll()]

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

    def get_queryset(self):
        user = self.request.user

        if user.is_anonymous:
            return Course.objects.none()
        if user.role == Roles.FACULTY:
            return Course.objects.filter(faculty_profile__user=user)
        else:
            roster_list = Roster.objects.filter(student_profile__user=user)
            course_ids = roster_list.values_list("course__id", flat=True)
            return Course.objects.filter(id__in=course_ids)


class RosterModelViewSet(viewsets.ModelViewSet):
    queryset = Roster.objects.select_related("course", "student_profile__user")
    serializer_class = RosterSerializer

    # def get_queryset(self):
    #     if self.request.user.role == Roles.FACULTY:
    #         faculty_profile_instance = FacultyProfile.objects.filter(
    #             user=self.request.user
    #         ).first()
    #         faculty_owned_course = Course.objects.filter(
    #             faculty_profile=faculty_profile_instance
    #         )
    #         serializer = CourseSerializer(faculty_owned_course, many=True)
    #         faculty_owned_courses = serializer.data
    #         owned_courses_id = [
    #             item["id"] for item in faculty_owned_courses if "id" in item
    #         ]
    #         owned_rosters = Roster.objects.filter(course_id__in=owned_courses_id)
    #         return owned_rosters
    #     else:
    #         student_profile_instance = StudentProfile.objects.filter(
    #             user=self.request.user
    #         ).first()
    #         owned_rosters = Roster.objects.filter(
    #             student_profile_id=student_profile_instance
    #         )
    #         return owned_rosters

    def get_permissions(self):
        if self.action in ["destroy"]:
            return [IsEnrolledStudent()]
        if self.action in ["create"]:
            return [Is_Student()]
        return [DenyAll()]

    # def get_object(self):
    #     queryset = self.get_queryset()
    #     user = self.request.user
    #     if user.role == Roles.FACULTY:
    #         raise PermissionDenied("Faculty is not allowed to get rosters")
    #     obj = get_object_or_404(
    #         queryset, course_id=self.kwargs["pk"], student_profile__user=user
    #     )
    #     return obj

    # def get_queryset(self):
    #     course_pk = self.kwargs.get("pk")
    #     return Roster.objects.filter(course_id=course_pk)

    def perform_create(self, serializer):
        course_pk = self.request.data.get("course_id")
        enrolling_course = get_object_or_404(Course, pk=course_pk)
        student_profile = get_object_or_404(StudentProfile, user=self.request.user)
        if Roster.objects.filter(
            course=enrolling_course, student_profile=student_profile
        ).exists():
            raise ValidationError("Student is already enrolled in this course.")

        serializer.save(course=enrolling_course, student_profile=student_profile)

    # def destroy(self, request, *args, **kwargs):
    #     course_pk = self.kwargs.get("pk")

    #     student_profile = get_object_or_404(StudentProfile, user=request.user)
    #     roster_query = get_object_or_404(
    #         Roster, course_id=course_pk, student_profile=student_profile
    #     )
    #     deleted_count = roster_query.delete()[0]
    #     message = (
    #         "Roster entry deleted."
    #         if deleted_count == 1
    #         else f"{deleted_count} entries deleted."
    #     )
    #     return Response({"message": message}, status=204)
