from rest_framework import serializers
from .models import Submission, RubricResult, TestResult

# --- Result Serializers (Used inside Submission) ---


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

    def validate_points_earned(self, value):
        """
        Example validation: Ensure points earned aren't negative.
        """
        if value < 0:
            raise serializers.ValidationError("Points earned cannot be negative.")
        return value


# --- Main Submission Serializer ---


class SubmissionSerializer(serializers.ModelSerializer):
    # These 'source' fields allow you to see the results directly on the submission object
    test_results = TestResultSerializer(many=True, read_only=True)
    rubric_results = RubricResultSerializer(many=True, read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id",
            "roster",
            "assignment",
            "group",
            "submitted_file",
            "test_results",
            "rubric_results",
        ]

    def validate(self, data):
        """
        Example validation: Ensure a group is provided if the assignment
        is marked as 'is_grouped' in your ERD.
        """
        assignment = data.get("assignment")
        if assignment and assignment.is_grouped and not data.get("group"):
            raise serializers.ValidationError("This assignment requires a group ID.")
        return data
