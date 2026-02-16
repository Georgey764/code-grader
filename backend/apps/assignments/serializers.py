from rest_framework import serializers
from .models import Assignment, RubricCriteria, TestCase
from apps.core.serializers import BaseSerializers


class RubricCriteriaSerializer(BaseSerializers):
    class Meta(BaseSerializers.Meta):
        model = RubricCriteria
        fields = [
            "id",
            "assignment",
            "name",
            "description",
            "max_points",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TestCaseSerializer(BaseSerializers):
    class Meta(BaseSerializers.Meta):
        model = TestCase
        fields = [
            "id",
            "assignment",
            "input_data",
            "expected_output",
            "is_public",
            "weight",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_weight(self, value):
        """Ensure weight is between 0 and 1"""
        if value < 0 or value > 1:
            raise serializers.ValidationError("Weight must be between 0 and 1")
        return value


class AssignmentSerializer(BaseSerializers):
    rubrics = RubricCriteriaSerializer(many=True, read_only=True)
    test_cases = TestCaseSerializer(many=True, read_only=True)

    class Meta(BaseSerializers.Meta):
        model = Assignment
        fields = [
            "id",
            "course",
            "name",
            "description",
            "deadline",
            "starter_code",
            "max_points_allowed",
            "is_grouped",
            "rubrics",
            "test_cases",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_max_points_allowed(self, value):
        """Ensure max points is positive"""
        if value <= 0:
            raise serializers.ValidationError("Max points must be greater than 0")
        return value


class AssignmentDetailSerializer(BaseSerializers):
    """Detailed serializer with nested relationships"""

    rubrics = RubricCriteriaSerializer(many=True, read_only=True)
    test_cases = TestCaseSerializer(many=True, read_only=True)
    course_name = serializers.CharField(source="course.name", read_only=True)
    course_short_name = serializers.CharField(
        source="course.short_name", read_only=True
    )

    class Meta(BaseSerializers.Meta):
        model = Assignment
        fields = [
            "id",
            "course",
            "course_name",
            "course_short_name",
            "name",
            "description",
            "deadline",
            "starter_code",
            "max_points_allowed",
            "is_grouped",
            "rubrics",
            "test_cases",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AssignmentListSerializer(BaseSerializers):
    """Lightweight serializer for list views"""

    course_name = serializers.CharField(source="course.name", read_only=True)
    rubric_count = serializers.IntegerField(source="rubrics.count", read_only=True)
    test_case_count = serializers.IntegerField(
        source="test_cases.count", read_only=True
    )

    class Meta(BaseSerializers.Meta):
        model = Assignment
        fields = [
            "id",
            "course",
            "course_name",
            "name",
            "deadline",
            "max_points_allowed",
            "is_grouped",
            "rubric_count",
            "test_case_count",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class AssignmentCreateSerializer(BaseSerializers):
    """Serializer for creating assignments with nested rubrics and test cases"""

    rubrics = RubricCriteriaSerializer(many=True, required=False)
    test_cases = TestCaseSerializer(many=True, required=False)

    class Meta(BaseSerializers.Meta):
        model = Assignment
        fields = [
            "id",
            "course",
            "name",
            "description",
            "deadline",
            "starter_code",
            "max_points_allowed",
            "is_grouped",
            "rubrics",
            "test_cases",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        rubrics_data = validated_data.pop("rubrics", [])
        test_cases_data = validated_data.pop("test_cases", [])

        assignment = Assignment.objects.create(**validated_data)

        # Create rubrics
        for rubric_data in rubrics_data:
            RubricCriteria.objects.create(assignment=assignment, **rubric_data)

        # Create test cases
        for test_case_data in test_cases_data:
            TestCase.objects.create(assignment=assignment, **test_case_data)

        return assignment
