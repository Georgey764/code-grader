from rest_framework import serializers
from apps.assessments.models import Submission, RubricResult, TestResult
from apps.assignments.serializers import TestCaseSerializer, RubricCriteriaSerializer
from apps.core.serializers import BaseSerializers


class RubricResultSerializer(serializers.ModelSerializer):
    # Expose rubric criterion details (name, description, max_points) for read-only use
    rubric_criteria_detail = RubricCriteriaSerializer(
        read_only=True, source="rubric_criteria"
    )

    class Meta:
        model = RubricResult
        fields = [
            "id",
            "submission",
            "rubric_criteria",
            "rubric_criteria_detail",
            "points_awarded",
            "optional_feedback",
        ]


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
