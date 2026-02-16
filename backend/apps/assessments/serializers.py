from rest_framework import serializers
from apps.assessments.models import Submission, RubricResult, TestResult


class TestResultSerializer(serializers.ModelSerializer):
    """
    Serializes individual test case results for a submission.
    """

    class Meta:
        model = TestResult
        fields = [
            "id",
            "test_case",
            "status",
            "actual_output",
            "error_message",
            "execution_time_ms",
            "points_earned",
        ]


class RubricResultSerializer(serializers.ModelSerializer):
    """
    Serializes the manual or automated rubric grading breakdown.
    """

    class Meta:
        model = RubricResult
        fields = ["id", "rubric_criteria", "points_awarded", "optional_feedback"]


class SubmissionSerializer(serializers.ModelSerializer):
    """
    The primary serializer for Submissions.
    Includes nested results for both rubrics and test cases.
    """

    # Nested fields: Note that 'related_name' from your models is used here
    rubric_results = RubricResultSerializer(many=True, read_only=True)
    test_results = TestResultSerializer(many=True, read_only=True)

    # Optional: If you want to show the assignment name/roster name instead of IDs
    assignment_name = serializers.CharField(source="assignment.name", read_only=True)
    student_name = serializers.CharField(source="roster.__str__", read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id",
            "roster",
            "student_name",
            "assignment",
            "assignment_name",
            "group",
            "code_submitted",
            "rubric_results",
            "test_results",
        ]
        read_only_fields = ["id"]
