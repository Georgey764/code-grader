from django.forms import ValidationError
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.assessments.models import PlagiarismMatch, Submission, RubricResult, TestResult
from apps.assessments.plagiarism_service import structural_diff_line_highlights
from apps.assessments.serializers import (
    SubmissionSerializer,
    RubricResultSerializer,
    TestResultSerializer,
    _submission_student_label,
)
from apps.assignments.models import Course, Assignment
from apps.assessments.services import run_untrusted_python
from apps.assessments.tasks import run_plagiarism_check_task, run_submission_tests_task
from apps.assignments.models import TestCase
from rest_framework.exceptions import APIException
from apps.core.permissions import IsStudent, DenyAll
from rest_framework.permissions import IsAuthenticated
from apps.assessments.permissions import (
    IsCreatingRubricResultsAssignmentGrader,
    IsSubmissionAssignmentAffiliated,
    IsRubricResultAssignmentGrader,
    IsCreatingSubmissionForEnrolledCourse,
)
from apps.accounts.models import Roles
from django.db.models import Prefetch, query
from apps.assignments.models import GroupsMembership
import logging
from django.shortcuts import get_object_or_404

logger = logging.getLogger(__name__)

from apps.assessments.ai_service import detect_ai_code

class SubmissionViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Handles student file uploads and listing submissions.
    """

    queryset = Submission.objects.select_related(
        "assignment__course__faculty_profile__user",
        "assignment__course__grading_assistant_profile__user",
        "roster__student_profile__user",
        "group",
    ).prefetch_related(
        Prefetch(
            "group__group_memberships__roster",
            queryset=GroupsMembership.objects.select_related("roster"),
        ),
        Prefetch(
            "rubric_results",
            queryset=RubricResult.objects.select_related("rubric_criteria"),
        ),
        Prefetch(
            "test_results",
            queryset=TestResult.objects.select_related("test_case"),
        ),
        Prefetch(
            "plagiarism_matches_as_a",
            queryset=PlagiarismMatch.objects.select_related(
                "submission_b__roster__student_profile__user"
            ),
        ),
        Prefetch(
            "plagiarism_matches_as_b",
            queryset=PlagiarismMatch.objects.select_related(
                "submission_a__roster__student_profile__user"
            ),
        ),
    )
    serializer_class = SubmissionSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action == "create":
            return [IsCreatingSubmissionForEnrolledCourse()]
        elif self.action == "list":
            return [IsAuthenticated()]
        elif self.action == "retrieve":
            return [IsSubmissionAssignmentAffiliated()]
        elif self.action == "plagiarism_diff":
            return [IsSubmissionAssignmentAffiliated()]
        elif self.action == "run_tests":
            return [(IsStudent & IsSubmissionAssignmentAffiliated)()]
        return [DenyAll()]

    # def get_object(self):
    #     submission_id = self.kwargs.get("id")
    #     return self.get_queryset().filter(pk=submission_id)

    def get_queryset(self):
        user = self.request.user
        assignment_id = self.request.GET.get("assignment_id")
        group_id = self.request.GET.get("group_id")
        roster_id = self.request.GET.get("roster_id")

        if self.action != "list":
            return super().get_queryset()

        if not assignment_id:
            raise ValidationError(
                {"assignment_id": "This search parameter is required"}
            )

        if user.role == Roles.STUDENT and (group_id or roster_id):
            raise ValidationError("Students cannot use param group_id or roster_id")

        queryset = super().get_queryset()

        assignment = get_object_or_404(Assignment, pk=assignment_id)
        if not assignment:
            raise ValidationError(
                {
                    "assignment_id": "The assignment with given assignment_id does not exist"
                }
            )

        queryset = super().get_queryset().filter(assignment_id=assignment_id)

        if group_id:
            if not assignment.is_grouped:
                raise ValidationError(
                    {
                        "group_id": "This param cannot be used for non grouped assignments"
                    }
                )
            else:
                queryset = queryset.filter(group_id=group_id)

        if roster_id:
            queryset = queryset.filter(roster_id=roster_id)

        if user.role == Roles.STUDENT:
            if assignment.is_grouped:
                membership = GroupsMembership.objects.filter(
                    roster__student_profile__user=user,
                    group__assignment_id=assignment_id,
                ).first()
                if not membership:
                    return queryset.none()
                return queryset.filter(group_id=membership.group_id)
            return queryset.filter(roster__student_profile__user=user)

        return queryset.filter(**{actual_filter: user})
    
    
    
    def perform_create(self, serializer):
        """
        Intercepts the student's submission right before it saves to the database 
        so we can run our Machine Learning AI detection on it.
        """
        # 1. Grab the actual code the student just uploaded
        student_code = self.request.data.get("submitted_file", "")
        
        # 2. Ask the ML Brain who wrote it
        prediction = None
        if student_code:
            prediction = detect_ai_code(student_code)
            
        submission = serializer.save(ai_prediction=prediction)
        run_plagiarism_check_task.delay(str(submission.id))

    @action(detail=True, methods=["get"], url_path="plagiarism-diff")
    def plagiarism_diff(self, request, id=None):
        """Side-by-side structural diff for faculty / grading assistants (normalized AST lines)."""
        if request.user.role == Roles.STUDENT:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        other_id = request.query_params.get("other_submission_id")
        if not other_id:
            return Response(
                {"detail": "Query parameter other_submission_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sub = self.get_object()
        other = get_object_or_404(Submission, pk=other_id)
        if other.assignment_id != sub.assignment_id:
            return Response(
                {"detail": "Submissions must belong to the same assignment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        meta = structural_diff_line_highlights(
            sub.submitted_file or "", other.submitted_file or ""
        )
        if meta is None:
            return Response(
                {
                    "detail": "Could not build structural diff (invalid Python or source too short)."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "left": {
                    "submission_id": str(sub.id),
                    "student_label": _submission_student_label(sub),
                    "lines": meta["left_normalized_lines"],
                },
                "right": {
                    "submission_id": str(other.id),
                    "student_label": _submission_student_label(other),
                    "lines": meta["right_normalized_lines"],
                },
                "highlight_left_indices": meta["highlight_left_indices"],
                "highlight_right_indices": meta["highlight_right_indices"],
            }
        )


    
    
        if user.role == Roles.FACULTY:
            return queryset.filter(
                assignment__course__faculty_profile__user=user
            )

        if user.role == Roles.GRADING_ASSISTANT:
            return queryset.filter(
                assignment__course__grading_assistant_profile__user=user
            )

        return queryset.none()

    @action(detail=True, methods=["post"], url_path="run-tests", url_name="run-tests")
    def run_tests(self, request, id=None):
        """
        Custom endpoint to trigger the autograder for a specific submission.
        Accessible at: POST /api/submissions/{id}/run_tests/
        """
        try:
            submission = self.get_object()
            logger.debug(f"Running tests for submission: {submission}")

            if not submission.submitted_file:
                return Response({"error": "No file attached"}, status=400)

            run_submission_tests_task.delay(submission.id)

            return Response(
                {"status": "Tests triggered", "submission_id": submission.id},
                status=status.HTTP_202_ACCEPTED,
            )

        except Exception as e:
            logger.error(f"Error triggering tests for submission {id}: {e}")
            return Response({"error": "Failed to trigger tests"}, status=500)


class RubricResultViewSet(viewsets.ModelViewSet):
    """
    Handles manual grading entries by faculty.
    """

    queryset = RubricResult.objects.select_related("submission", "rubric_criteria")
    serializer_class = RubricResultSerializer

    def get_permissions(self):
        if self.action in ["retrieve", "update", "partial_update"]:
            return [IsRubricResultAssignmentGrader()]
        elif self.action == "create":
            return [IsCreatingRubricResultsAssignmentGrader()]
        return [DenyAll()]

    # def get_queryset(self):
    #     submission_id = self.request.GET.get("submission_id")
    #     queryset = ""
    #     return super().get_queryset()
