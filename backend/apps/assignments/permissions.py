from rest_framework.permissions import BasePermission
from apps.accounts.models import Roles
from apps.courses.models import Roster, Course
from apps.assignments.models import Assignment


class IsAssignmentAffiliated(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False

        course = getattr(obj, "course", None)
        if not course:
            return False

        if user.role == Roles.FACULTY:
            return course.faculty_profile.user == user

        if user.role == Roles.STUDENT:
            return Roster.objects.filter(
                course=course, student_profile__user=user
            ).exists()

        if user.role == Roles.GRADING_ASSISTANT:
            return (
                getattr(course, "grading_assistant_profile", None)
                and course.grading_assistant_profile.user == user
            )

        return False


class IsAssignmentOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        if request.user.role == Roles.FACULTY:
            return (
                hasattr(obj, "course")
                and hasattr(obj.course, "faculty_profile")
                and obj.course.faculty_profile.user == request.user
            )

        return False


class IsParentCoursesOwner(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        if request.method == "POST":
            course_id = request.data.get("course")
            return Course.objects.filter(
                id=course_id, faculty_profile__user=request.user
            ).exists()
        return False


class IsParentAssignmentOwner(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        if request.method == "POST":
            return Assignment.objects.filter(
                pk=view.kwargs.get("assignment_id"),
                course__faculty_profile__user=request.user,
            ).exists()

        return True

    def has_object_permission(self, request, view, obj):

        if not request.user.role == Roles.FACULTY:
            return False

        assignment = getattr(obj, "assignment", None)

        try:
            return assignment.course.faculty_profile.user == request.user
        except AttributeError:
            return False


class IsParentAssignmentGrader(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user.is_authenticated:
            return False

        if user.role == Roles.FACULTY:
            return (
                hasattr(obj, "assignment")
                and hasattr(obj.assignment, "course")
                and hasattr(obj.assignment.course, "faculty_profile")
                and obj.assignment.course.faculty_profile.user == request.user
            )

        elif user.role == Roles.GRADING_ASSISTANT:
            return (
                hasattr(obj, "assignment")
                and hasattr(obj.assignment, "course")
                and hasattr(obj.assignment.course, "grading_assistant_profile")
                and obj.assignment.course.grading_assistant_profile.user == request.user
            )

        return False


class IsParentAssignmentAffiliated(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        assignment = getattr(obj, "assignment", None)
        if not assignment:
            return False

        if user.role == Roles.FACULTY:
            try:
                return assignment.course.faculty_profile.user == user
            except AttributeError:
                return False

        elif user.role == Roles.GRADING_ASSISTANT:
            try:
                return assignment.course.grading_assistant_profile.user == user
            except AttributeError:
                return False

        elif user.role == Roles.STUDENT:
            try:
                course_rosters = assignment.course.rosters.all()
                return any(
                    roster.student_profile.user == user for roster in course_rosters
                )
            except AttributeError:
                return False

        return False


class IsGroupLeader(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.role == Roles.STUDENT:
            return False

        return obj.group_memberships.filter(
            roster__student_profile__user=user, is_leader=True
        ).exists()
