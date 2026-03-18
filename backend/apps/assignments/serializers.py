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
from django.db.models import Sum


class RubricCriteriaSerializer(BaseSerializers):
    class Meta(BaseSerializers.Meta):
        model = RubricCriteria
        fields = [
            "id",
            "assignment",
            "name",
            "weight",  # Added
            "desc_one",  # Added
            "desc_two",  # Added
            "desc_three",  # Added
            "desc_four",  # Added
            "desc_five",  # Added
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        """
        Check that the sum of weights for the assignment does not exceed 100.
        """
        assignment = data.get("assignment")
        new_weight = data.get("weight", 0)

        assignment = Assignment.objects.get(id=assignment.id)
        if not assignment.is_weighted:
            return data

        # Calculate existing weights for this assignment
        existing_weight_sum = (
            RubricCriteria.objects.filter(assignment=assignment).aggregate(
                total=Sum("weight")
            )["total"]
            or 0
        )

        # If updating an existing instance, subtract its current weight from the sum
        if self.instance:
            existing_weight_sum -= self.instance.weight

        if assignment.is_weighted and existing_weight_sum + new_weight > 100:
            raise serializers.ValidationError(
                {
                    "weight": f"Total weight for this assignment would be {existing_weight_sum + new_weight}. It must not exceed 100."
                }
            )

        return data


class AssignmentSerializer(BaseSerializers):
    # Using ChoiceField to ensure the ENUM is validated at the API level
    language = serializers.ChoiceField(choices=Assignment.Language.choices)

    class Meta(BaseSerializers.Meta):
        model = Assignment
        fields = [
            "id",
            "course",
            "name",
            "description",
            "deadline",
            "starter_code",
            "is_grouped",
            "language",
            "is_file_input",
            "is_weighted",  # Added your new field
            "rubric_criterias",  # Assuming this is a related field/nested serializer
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = [
            "id",
            "assignment",
            "text_input",
            "time_limit",
            "is_hidden",
            "expected_output",
        ]


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
