from django.shortcuts import render
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
from apps.courses.permissions import Is_Roster_Owner
from rest_framework.response import Response
from rest_framework import status


class CourseModelViewset(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ["create", "list"]:
            return [Is_Faculty()]
        return [Is_Course_Owner()]

    def create(self, request, *args, **kwargs):
        faculty_profile_instance = FacultyProfile.objects.filter(
            user=request.user
        ).first()

        if not faculty_profile_instance:
            return Response(
                {"error": "Faculty profile not found"}, status=status.HTTP_404_NOT_FOUND
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

        return Course.objects.filter(faculty_profile__user=user)


class RosterModelViewSet(viewsets.ModelViewSet):
    queryset = Roster.objects.all()
    serializer_class = RosterSerializer

    def create(self, request, *args, **kwargs):
        if self.request.role == Roles.STUDENT:
            body_data = request.data
            serializer = self.get_serializer(data=body_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    def get_queryset(self):
        if self.request.user.role == Roles.FA:
            faculty_profile_instance = FacultyProfile.objects.filter(
                user=self.request.user
            )
            faculty_owned_course = Course.objects.filter(
                faculty_profile=faculty_profile_instance
            )
            serializer = CourseSerializer(faculty_owned_course, many=True)
            faculty_owned_courses = serializer.data
            owned_courses_id = [
                item["id"] for item in faculty_owned_courses if "id" in item
            ]
            owned_rosters = None
            if owned_courses_id:
                owned_rosters = Roster.objects.filter(course_id__in=owned_courses_id)
                serializer = RosterSerializer(owned_rosters, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"detail": "No rosters found for the given courses."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            student_profile_instance = StudentProfile.objects.filter(
                user=self.request.user
            )
            owned_rosters = Roster.objects.filter(
                student_profile_id=student_profile_instance
            )
            if owned_rosters:
                serializer = RosterSerializer(owned_rosters, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(
                {"detail": "No rosters found for the given courses."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def get_permissions(self):
        if self.action in ["list"]:
            return [IsAuthenticated()]
        if self.action in ["retrieve", "destroy"]:
            return [Is_Roster_Owner()]
        if self.action in ["create"]:
            return [Is_Student()]
        return [DenyAll()]
