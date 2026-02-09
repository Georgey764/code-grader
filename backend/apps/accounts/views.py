from rest_framework import viewsets
from django.contrib.auth import get_user_model
from .models import FacultyProfile, StudentProfile
from .serializers import UserSerializer, FacultyProfileSerializer, StudentProfileSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class FacultyProfileViewSet(viewsets.ModelViewSet):
    queryset = FacultyProfile.objects.all()
    serializer_class = FacultyProfileSerializer

class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer