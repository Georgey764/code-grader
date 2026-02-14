from rest_framework.permissions import BasePermission
from apps.accounts.models import Roles


class Is_Faculty(BasePermission):
    message = "Access denied. Only Faculty accounts can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) == Roles.FACULTY
        )


class Is_Student(BasePermission):
    message = "Access denied. Only Student accounts can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) == Roles.STUDENT
        )


class DenyAll(BasePermission):
    message = "This action has been disabled for this resource."

    def has_permission(self, request, view):
        return False
