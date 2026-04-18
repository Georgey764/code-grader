"""
Faculty-only cohort plagiarism checks across course sections sharing the same short_name.
"""

from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assessments.models import Submission
from apps.core.permissions import IsFaculty

from apps.plag_detector.cohort_service import compare_cohort_for_submission


class SubmissionPlagiarismCohortView(APIView):
    """
    POST: compare this submission to other students' submissions only (same student’s
    other attempts are excluded) across sections sharing course short_name, assignment
    name, and language. Faculty course owner only.
    """

    permission_classes = [IsAuthenticated, IsFaculty]

    def post(self, request, submission_id):
        submission = get_object_or_404(
            Submission.objects.select_related(
                "assignment__course__faculty_profile__user",
                "roster__student_profile__user",
            ),
            pk=submission_id,
        )
        course = submission.assignment.course
        try:
            if course.faculty_profile.user_id != request.user.id:
                return Response(
                    {"detail": "Not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        except AttributeError:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        payload = compare_cohort_for_submission(submission)
        return Response(payload, status=status.HTTP_200_OK)
