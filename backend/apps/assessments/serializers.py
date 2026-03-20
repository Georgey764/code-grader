from django.utils import timezone
from rest_framework import serializers
from apps.assessments.models import Submission, RubricResult, TestResult
from apps.assignments.serializers import TestCaseSerializer, RubricCriteriaSerializer
from apps.core.serializers import BaseSerializers

from rest_framework import serializers


class RubricResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricResult
        fields = ["id", "submission", "rubric_criteria", "points", "optional_feedback"]

    def validate_points(self, value):
        """
        Validate that points are within the enum range (1-5).
        """
        rubric_criteria = self.context.get("rubric_criteria") or (
            self.instance.rubric_criteria if self.instance else None
        )
        if rubric_criteria and value > rubric_criteria.max_points:
            raise serializers.ValidationError(
                "Points must be less than or equal to the maximum points."
            )
        return value


class TestResultSerializer(serializers.ModelSerializer):
    test_case = TestCaseSerializer(read_only=True)

    class Meta:
        model = TestResult
        fields = "__all__"


class SubmissionSerializer(BaseSerializers):
    test_results = TestResultSerializer(many=True, read_only=True)
    rubric_results = RubricResultSerializer(many=True, read_only=True)

    class Meta(BaseSerializers.Meta):
        model = Submission
        fields = BaseSerializers.Meta.fields + [
            "id",
            "test_results",
            "roster",
            "assignment",
            "group",
            "submitted_file",
            "status",
            "rubric_results",
        ]

    def validate(self, attrs):
        """
        Validate that the submitted file is a valid file.
        """
        assignment = attrs.get("assignment")
        deadline = assignment.deadline
        if deadline < timezone.now():
            raise serializers.ValidationError("Deadline has passed")
        return attrs
