from rest_framework.permissions import BasePermission
from apps.accounts.models import Roles


class IsFaculty(BasePermission):
    message = "Access denied. Only Faculty accounts can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) == Roles.FACULTY
        )


class IsStudent(BasePermission):
    message = "Access denied. Only Student accounts can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) == Roles.STUDENT
        )


class IsGradingAssistant(BasePermission):
    message = "Access denied. Only Grading Assistants can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) == Roles.GRADING_ASSISTANT
        )


class DenyAll(BasePermission):
    message = "This action has been disabled for this resource."

    def has_permission(self, request, view):
        return False
