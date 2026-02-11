from apps.core.serializers import BaseSerializers
from rest_framework import serializers
from .models import Group, GroupMembership

from apps.accounts.serializers import StudentProfileSerializer, StudentSerializer
from apps.course.serializers import CourseSerializer

class GroupsMembershipSerializer(BaseSerializers):
    
    student_details = StudentSerializer(source='student', read_only=True)
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta(BaseSerializers.Meta):
        model = GroupMembership
        fields =[
            'id',
            'group',
            'group_name',
            'student',
            'student_details',
        ]
        
class GroupSerializer(BaseSerializers):
    
    course_details = CourseSerializer(source='course', read_only=True)
    
    members = GroupsMembershipSerializer(source='member', many=True, read_only=True)
    
    class Meta(BaseSerializers.Meta):
        model = Group
        fields = [
            'id',
            'name',
            'course',
            'course_details',
            'members',
        ]
        