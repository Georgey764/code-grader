from rest_framework.permissions import BasePermission
from apps.accounts.models import Roles
from apps.courses.models import Roster


class Is_Course_Owner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(request.user == obj.faculty_profile.user)


class Is_Course_Affiliated(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == Roles.STUDENT:
            return Roster.objects.filter(
                course=obj, student_profile__user=request.user
            ).exists()
        return bool(request.user == obj.faculty_profile.user)


class Is_Roster_Owner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == Roles.FACULTY:
            return bool(request.user == obj.faculty_profile.user)
        return bool(request.user == obj.student_profile.user)


class IsEnrolledStudent(BasePermission):
    def has_object_permission(self, request, view, obj):
        print(obj)
        return (
            request.user.is_authenticated
            and hasattr(obj, "student_profile")
            and obj.student_profile.user == request.user
        )
