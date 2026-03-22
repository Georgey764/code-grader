from django.db import transaction
from rest_framework import serializers
from apps.assignments.models import (
    Assignment,
    RubricCriteria,
    TestCase,
    Group,
    GroupsMembership,
)
from apps.courses.models import Roster
from apps.accounts.models import StudentProfile
from apps.accounts.serializers import UserDetailSerializer
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
            "weight",
            "max_points",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_weight(self, value):
        assignment = self.context.get("assignment")
        if assignment and assignment.is_weighted:
            if value <= 0:
                raise serializers.ValidationError(
                    "Weighted criteria must have a positive weight."
                )
        return value

    def validate(self, data):
        """
        Check that the sum of weights for the assignment does not exceed 100.
        """
        assignment = data.get("assignment") or (
            self.instance.assignment if self.instance else None
        )
        new_weight = data.get("weight", 0)

        if not assignment or not assignment.is_weighted:
            return data

        existing_weight_sum = (
            RubricCriteria.objects.filter(assignment=assignment).aggregate(
                total=Sum("weight")
            )["total"]
            or 0
        )

        if self.instance:
            existing_weight_sum -= self.instance.weight

        if existing_weight_sum + new_weight > 100:
            raise serializers.ValidationError(
                {
                    "weight": (
                        f"Total weight for this assignment would be "
                        f"{existing_weight_sum + new_weight}. It must not exceed 100."
                    )
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


class StudentProfileLightSerializer(serializers.ModelSerializer):
    user = UserDetailSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ["id", "user"]


class RosterStudentBriefSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileLightSerializer(read_only=True)

    class Meta:
        model = Roster
        fields = ["id", "student_profile"]


class GroupsMembershipSerializer(serializers.ModelSerializer):
    roster_student = RosterStudentBriefSerializer(source="roster", read_only=True)

    class Meta:
        model = GroupsMembership
        fields = ["id", "group", "roster", "is_leader", "roster_student"]
        read_only_fields = ["id", "roster_student"]
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
        if roster is None and self.instance:
            roster = self.instance.roster
        if group is None and self.instance:
            group = self.instance.group

        if roster is not None and group is not None:
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

    @transaction.atomic
    def create(self, validated_data):
        if validated_data.get("is_leader"):
            group = validated_data["group"]
            GroupsMembership.objects.filter(group=group).update(is_leader=False)
        return super().create(validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        if validated_data.get("is_leader") is True:
            GroupsMembership.objects.filter(group=instance.group).exclude(
                pk=instance.pk
            ).update(is_leader=False)
        return super().update(instance, validated_data)


class GroupSerializer(serializers.ModelSerializer):
    current_count = serializers.IntegerField(
        source="group_memberships.count", read_only=True
    )
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
