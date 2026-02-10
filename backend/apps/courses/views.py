from django.shortcuts import render
from rest_framework import viewsets
from apps.courses.models import Course
from apps.courses.serializers import CourseSerializer
from apps.core.permissions import Is_Faculty
from apps.courses.permissions import Is_Course_Owner
from apps.accounts.models import Roles, FacultyProfile
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response


class CourseModelViewset(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ["create", "list"]:
            return [Is_Faculty()]
        return [Is_Course_Owner()]

    @transaction.atomic
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


# class RosterModelViewSet()
