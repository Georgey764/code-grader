from rest_framework.permissions import BasePermission
from apps.accounts.models import Roles
from apps.courses.models import Roster


class IsCourseOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        return (
            hasattr(obj, "faculty_profile") and obj.faculty_profile.user == request.user
        )


class IsCourseAffiliated(BasePermission):
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

        if role == Roles.GRADING_ASSISTANT:
            return bool(
                hasattr(obj, "grading_assistant_profile")
                and request.user == obj.grading_assistant_profile.user
            )

        return False


class IsRosterOwner(BasePermission):
    def has_object_permission(self, request, view, obj):

        if not request.user.is_authenticated:
            return False

        if request.user.role == Roles.STUDENT:
            return (
                hasattr(obj, "student_profile")
                and obj.student_profile.user == request.user
            )

        if request.user.role == Roles.FACULTY:
            return (
                hasattr(obj, "course")
                and hasattr(obj.course, "faculty_profile")
                and obj.course.faculty_profile.user == request.user
            )

        return False


# class IsRosterAffiliated(BasePermission):
#     def has_object_permission(self, request, view, obj):

#         if not request.user.is_authenticated:
#             return False

#         if request.user.role == Roles.STUDENT:
#             return (
#                 hasattr(obj, "student_profile")
#                 and obj.student_profile.user == request.user
#             )

#         if request.user.role == Roles.FACULTY:
#             return (
#                 hasattr(obj, "course")
#                 and hasattr(obj.course, "faculty_profile")
#                 and obj.course.faculty_profile.user == request.user
#             )

#         if request.user.role == Roles.GRADING_ASSISTANT:
#             return (
#                 hasattr(obj, "course")
#                 and hasattr(obj.course, "grading_assistant_profile")
#                 and obj.course.grading_assistant_profile == request.user,
#             )

#         return False
