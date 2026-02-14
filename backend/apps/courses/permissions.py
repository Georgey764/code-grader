from rest_framework.permissions import BasePermission
from apps.accounts.models import Roles
from apps.courses.models import Roster


class Is_Course_Owner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        return (
            hasattr(obj, "faculty_profile") and obj.faculty_profile.user == request.user
        )


class Is_Course_Affiliated(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        role = getattr(request.user, "role", None)

        if role == Roles.STUDENT:
            return Roster.objects.filter(
                course=obj, student_profile__user=request.user
            ).exists()

        if role == Roles.FACULTY:
            return bool(
                hasattr(obj, "faculty_profile")
                and request.user == obj.faculty_profile.user
            )

        return False


# class Is_Roster_Owner(BasePermission):
#     def has_object_permission(self, request, view, obj):
#         if not request.user.is_authenticated:
#             return False

#         role = getattr(request.user, "role", None)

#         if role == Roles.FACULTY:
#             return bool(
#                 hasattr(obj, "faculty_profile")
#                 and request.user == obj.faculty_profile.user
#             )

#         if role == Roles.STUDENT:
#             return bool(request.user == obj.student_profile.user)

#         return False


class IsEnrolledStudent(BasePermission):
    def has_object_permission(self, request, view, obj):
        print(obj)
        return (
            request.user.is_authenticated
            and hasattr(obj, "student_profile", None)
            and obj.student_profile.user == request.user
        )
