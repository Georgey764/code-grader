from rest_framework import serializers
from apps.assignments.models import (
    Assignment,
    RubricCriteria,
    TestCase,
    Group,
    GroupsMembership,
)
from apps.core.serializers import BaseSerializers
from rest_framework.validators import UniqueTogetherValidator


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


class AssignmentSerializer(BaseSerializers):
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
            "language",  # Added
            "is_file_input",  # Added
            "rubric_criterias",
            "test_cases",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = "__all__"


class GroupsMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupsMembership
        fields = ["id", "group", "roster", "is_leader"]
        read_only_fields = ["id"]
        validators = [
            UniqueTogetherValidator(
                queryset=GroupsMembership.objects.all(),
                fields=["group", "roster"],
                message="This student is already a member of this group",
            ),
        ]

    def validate(self, attrs):
        # CUSTOM CHECK: Ensure student isn't in another group for this assignment
        roster = attrs.get("roster")
        group = attrs.get("group")

        if (
            GroupsMembership.objects.filter(
                roster=roster, group__assignment=group.assignment
            )
            .exclude(group=group)
            .exists()
        ):
            raise serializers.ValidationError(
                "This student is already assigned to a group for this assignment."
            )

        return attrs


class GroupSerializer(serializers.ModelSerializer):
    current_count = serializers.IntegerField(source="memberships.count", read_only=True)
    group_memberships = GroupsMembershipSerializer(read_only=True, many=True)

    class Meta:
        model = Group
        fields = [
            "id",
            "assignment",
            "name",
            "max_members",
            "current_count",
            "group_memberships",
        ]
        read_only_fields = ["id", "group_memberships"]

    def validate(self, data):
        """
        Optional: Check if max_members is a positive integer.
        """
        if data.get("max_members", 1) < 1:
            raise serializers.ValidationError("A group must allow at least 1 member.")

        # 1. Access the assignment object from the validated data
        assignment = data.get("assignment")

        # 2. Check if the assignment allows grouping
        # Note: We check this only during 'create' (when assignment is provided)
        if assignment and not assignment.is_grouped:
            raise serializers.ValidationError(
                {
                    "assignment": "Groups cannot be created for this assignment because is_grouped is False."
                }
            )

        # 3. Existing check for max_members
        if data.get("max_members", 1) < 1:
            raise serializers.ValidationError("A group must allow at least 1 member.")

        return data
