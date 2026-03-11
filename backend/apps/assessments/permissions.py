from apps.assessments.models import Submission
from apps.core.permissions import BasePermission
from apps.accounts.models import Roles
from apps.courses.models import Roster
from apps.assignments.models import Assignment


class IsCreatingSubmissionForEnrolledCourse(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if user.role != Roles.STUDENT:
            return False

        if not user.is_authenticated:
            return False

        assignment_id = request.data.get("assignment", None)
        if not assignment_id:
            return False

        assignment = Assignment.objects.get(id=assignment_id)

        return Roster.objects.filter(
            course=assignment.course, student_profile__user=user
        ).exists()


class IsSubmissionAssignmentAffiliated(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        assignment = getattr(obj, "assignment", None)
        if not assignment:
            return False

        if not user.is_authenticated:
            return False

        if user.role == Roles.FACULTY:
            try:
                return assignment.course.faculty_profile.user == user
            except AttributeError:
                return False

        if user.role == Roles.STUDENT:
            try:
                course = assignment.course
                return course.rosters.filter(student_profile__user=user).exists()
            except AttributeError:
                return False

        if user.role == Roles.GRADING_ASSISTANT:
            try:
                return assignment.course.grading_assistant_profile.user == user
            except AttributeError:
                return False

        return False


class IsRubricResultAssignmentGrader(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False

        if user.role == Roles.STUDENT:
            return False

        submission = getattr(obj, "submission", None)
        if not submission:
            return False

        assignment = getattr(submission, "assignment", None)
        if not assignment:
            return False

        if user.role == Roles.FACULTY:
            try:
                return assignment.course.faculty_profile.user == user
            except AttributeError:
                return False

        if user.role == Roles.GRADING_ASSISTANT:
            try:
                return assignment.course.grading_assistant_profile.user == user
            except AttributeError:
                return False

        return False


class IsCreatingRubricResultsAssignmentGrader(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        if user.role == Roles.STUDENT:
            return False

        submission_id = request.data.get("submission")
        if not submission_id:
            return False

        try:
            submission = Submission.objects.get(pk=submission_id)
        except AttributeError:
            return False

        if user.role == Roles.FACULTY:
            try:
                return submission.assignment.course.faculty_profile.user == user
            except AttributeError:
                return False

        if user.role == Roles.GRADING_ASSISTANT:
            try:
                return (
                    submission.assignment.course.grading_assistant_profile.user == user
                )
            except AttributeError:
                return False

        return False
