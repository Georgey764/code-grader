from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from apps.accounts.models import User, StudentProfile, FacultyProfile
from apps.accounts.serializers import (
    RegisterSerializer,
    StudentSerializer,
    FacultySerializer,
)
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
# Create your views here.


class UsersCreateView(generics.CreateAPIView):
    queryset = User.objects
    serializer_class = RegisterSerializer


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentProfile.objects.select_related("user").all()
    serializer_class = StudentSerializer
    lookup_field = "user__cwid"
    lookup_url_kwarg = "cwid"


class FacultyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FacultyProfile.objects.select_related("user").all()
    serializer_class = FacultySerializer
    lookup_field = "user__cwid"
    lookup_url_kwarg = "cwid"


class HelloView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": f"Hello {request.user.username}"})
