from rest_framework import serializers
from .models import Group, GroupsMembership


class GroupsMembershipSerializer(serializers.ModelSerializer):
    # We use StringRelatedField to show the roster name,
    # or you can use a dedicated RosterSerializer here.
    roster_name = serializers.CharField(source="roster.__str__", read_only=True)

    class Meta:
        model = GroupsMembership
        fields = ["id", "group", "roster", "roster_name", "is_leader"]
        read_only_fields = ["id"]


class GroupSerializer(serializers.ModelSerializer):
    # Nested serializer to show members when retrieving a group
    memberships = GroupsMembershipSerializer(many=True, read_only=True)
    current_count = serializers.IntegerField(source="memberships.count", read_only=True)

    class Meta:
        model = Group
        fields = [
            "id",
            "assignment",
            "name",
            "max_members",
            "current_count",
            "memberships",
        ]
        read_only_fields = ["id"]

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
