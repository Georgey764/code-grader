from rest_framework import serializers
from apps.assessments.models import Submission, RubricResult, TestResult


class RubricResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricResult
        fields = [
            "id",
            "submission",
            "rubric_criteria",
            "points_awarded",
            "optional_feedback",
        ]


class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = [
            "id",
            "submission",
            "test_case",
            "status",
            "output_file",
            "error_message",
            "execution_time_ms",
            "points_earned",
        ]


class SubmissionSerializer(serializers.ModelSerializer):
    # Nested results to show grading details alongside the submission
    rubric_results = RubricResultSerializer(many=True, read_only=True)
    test_results = TestResultSerializer(many=True, read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id",
            "roster",
            "assignment",
            "group",
            "submitted_file",
            "rubric_results",
            "test_results",
        ]
