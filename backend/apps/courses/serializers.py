from rest_framework import serializers
from .models import Course, Roster
from apps.accounts.serializers import FacultyProfileSerializer, StudentProfileSerializer

class CourseSerializer(serializers.ModelSerializer):
    
    faculty_details = FacultyProfileSerializer(source='faculty', read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id',
            'name',
            'short_name',
            'crn',
            'description',
            'is_active',
            'faculty', 
            'faculty_details',
            'created_at',
            'updated_at'
        ]
        
class RosterSerializer(serializers.ModelSerializer):
    
    student_details = StudentProfileSerializer(source='student', read_only=True)
    
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = Roster
        fields = [
            'id',
            'course',
            'course_name',
            'student',
            'student_details',
            'created_at'
        ]