from rest_framework import generics
from apps.accounts.models import (
    User,
    StudentProfile,
    FacultyProfile,
    GradingAssistantProfile,
)
from apps.accounts.serializers import (
    RegisterSerializer,
    StudentSerializer,
    FacultySerializer,
    GradingAssistantSerializer,
)
from rest_framework.permissions import AllowAny
from apps.core.permissions import IsFaculty, IsStudent, IsGradingAssistant, DenyAll
from apps.accounts.permissions import IsProfileOwner
from rest_framework.permissions import IsAuthenticated
# Create your views here.


class UsersCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class StudentDetailView(generics.RetrieveUpdateAPIView):
    queryset = StudentProfile.objects.select_related("user")
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
        if self.request.method in ["GET"]:
            return [IsAuthenticated()]
        if self.request.method in ["PUT", "PATCH"]:
            return [IsStudent(), IsProfileOwner()]
        # if self.request.method in ["DELETE", "POST"]:
        #     return [DenyAll()]
        return [DenyAll()]


class FacultyDetailView(generics.RetrieveUpdateAPIView):
    queryset = FacultyProfile.objects.select_related("user")
    serializer_class = FacultySerializer
    lookup_field = "user__cwid"
    lookup_url_kwarg = "cwid"

    def get_permissions(self):
        if self.request.method in ["GET"]:
            return [IsAuthenticated()]
        if self.request.method in ["PUT", "PATCH"]:
            return [IsFaculty(), IsProfileOwner()]
        return [DenyAll()]


class GradingAssistantDetailView(generics.RetrieveUpdateAPIView):
    queryset = GradingAssistantProfile.objects.select_related("user")
    serializer_class = GradingAssistantSerializer
    lookup_field = "user__cwid"
    lookup_url_kwarg = "cwid"

    def get_permissions(self):
        if self.request.method in ["GET"]:
            return [IsGradingAssistant()]
        if self.request.method in ["PUT", "PATCH"]:
            return [IsGradingAssistant(), IsProfileOwner()]
        return [DenyAll()]
