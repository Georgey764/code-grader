from rest_framework import serializers
from apps.core.serializers import BaseSerializers
from .models import Group, GroupsMembership

class GroupMembershipSerializer(BaseSerializers):
    student_name = serializers.CharField(source="roster.student_profile.user.first_name", read_only=True)
    student_cwid = serializers.CharField(source="roster.student_profile.user.cwid", read_only=True)
    group_name = serializers.CharField(source="group.name", read_only=True)
    
    class Meta(BaseSerializers.Meta):
        model = GroupsMembership
        fields = [
            "id", 
            "group", 
            "group_name",
            "roster", 
            "student_name", 
            "student_cwid", 
            "is_leader"
        ]
    
class GroupSerializer(BaseSerializers):
    course_short_name = serializers.CharField(source="course.short_name", read_only=True)
    memberships = GroupMembershipSerializer(many=True, read_only=True)
    current_members_count = serializers.IntegerField(source="memberships.count", read_only=True)
    
    class Meta(BaseSerializers.Meta):
        model = Group
        fields = [
            "id", 
            "course", 
            "course_short_name", 
            "name", 
            "max_members", 
            "current_members_count", 
            "memberships"
        ]
    
class GroupCreateSerializer(BaseSerializers):
    class Meta(BaseSerializers.Meta):
        model = Group
        fields = ["id", "course", "name", "max_members"]
        
        
    def validate_max_members(self, value):
        if value < 2:
            raise serializers.ValidationError("A group must allow at least 2 members.")
        return value