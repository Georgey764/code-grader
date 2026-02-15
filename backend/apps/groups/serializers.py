from rest_framework import serializers
from apps.core.serializers import BaseSerializers
from .models import Group, GroupMembership
from apps.courses.serializers import CourseSerializer, RosterSerializer

class GroupMembershipSerializer(BaseSerializers):
    
    student_name = serializers.CharField(source='roster.student_profile.user.first_name', read_only=True)
    student_cwid = serializers.CharField(source='roster.student_profile.user.cwid', read_only=True)
    
    class Meta(BaseSerializers.Meta):
        model = GroupMembership
        fields = [
           "id",
           "group",
           "roster",
           "student_name",
           "student_cwid",
           "is_leader",
           "created_at",
            "updated_at",
       ]
        
class GroupListSerializer(BaseSerializers):
    course_short_name = serializers.CharField(source='course.short_name', read_only=True)
    memberships = GroupMembershipSerializer(many=True, read_only=True)
    
    class Meta(BaseSerializers.Meta):
        model = Group
        fields = [
            "id",
            "course",
            "course_short_name",
            "name",
            "max_members",
            "memberships",
            "created_at",
            "updated_at",
        ]
    
class GroupDetailSerializer(GroupListSerializer):
    course_short_name = serializers.CharField(source='course.short_name', read_only=True)
    memberships = GroupMembershipSerializer(many=True, read_only=True)
    
    class Meta(BaseSerializers.Meta):
        model = Group
        fields =[
            "id",
            "course",
            "course_short_name",
            "name",
            "max_members",
            "memberships",
            "created_at",
            "updated_at",  
        ]
        
class GroupCreateSerializer(BaseSerializers):
    class Meta(BaseSerializers.Meta):
        model = Group
        fields = [
            "id",
            "course",
            "name",
            "max_members"]
    def validate_max_members(self, value):
        if value < 2:
            raise serializers.ValidationError("A group must have at least 2 members.")
        return value