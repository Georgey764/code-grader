from rest_framework.permissions import BasePermission
from apps.accounts.models import Roles


class Is_Faculty(BasePermission):
    message = "Access denied. Only Faculty accounts can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.role == Roles.FACULTY)


class Is_Student(BasePermission):
    message = "Access denied. Only Student accounts can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.role == Roles.STUDENT)
