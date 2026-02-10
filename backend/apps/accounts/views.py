from rest_framework import generics
from apps.accounts.models import User, StudentProfile, FacultyProfile
from apps.accounts.serializers import (
    RegisterSerializer,
    StudentSerializer,
    FacultySerializer,
)
from rest_framework.permissions import AllowAny
from apps.core.permissions import Is_Faculty, Is_Student
from apps.accounts.permissions import Is_Profile_Owner
# Create your views here.


class UsersCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    queryset = User.objects
    serializer_class = RegisterSerializer


class StudentDetailView(generics.RetrieveUpdateAPIView):
    queryset = StudentProfile.objects.select_related("user").all()
    serializer_class = StudentSerializer
    lookup_field = "user__cwid"
    lookup_url_kwarg = "cwid"

    # @transaction.atomic
    # def destroy(self, request, *args, **kwargs):
    #     student_profile_instance = self.get_object()
    #     user = student_profile_instance.user
    #     user.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.request.method in ["GET", "PUT", "PATCH"]:
            return [Is_Student(), Is_Profile_Owner()]
        return super().get_permissions()


class FacultyDetailView(generics.RetrieveUpdateAPIView):
    queryset = FacultyProfile.objects.select_related("user").all()
    serializer_class = FacultySerializer
    lookup_field = "user__cwid"
    lookup_url_kwarg = "cwid"

    # @transaction.atomic
    # def destroy(self, request, *args, **kwargs):
    #     faculty_profile_instance = self.get_object()
    #     user = faculty_profile_instance.user
    #     user.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.request.method in ["GET", "PUT", "PATCH"]:
            return [Is_Faculty(), Is_Profile_Owner()]
        return super().get_permissions()
