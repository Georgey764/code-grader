from rest_framework.permissions import BasePermission
from apps.accounts.models import Roles


class Is_Course_Owner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(request.user == obj.faculty_profile.user)


class Is_Roster_Owner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == Roles.FACULTY:
            return request.user == obj.faculty_profile.user
        return request.user == obj.student_profile.user
