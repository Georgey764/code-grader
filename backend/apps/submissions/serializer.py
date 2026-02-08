from rest_framework import serializers
from .models import Submission
from apps.assignments.models import Assignment
from apps.groups.models import Group
from apps.courses.models import Roster

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = [
            'id',
            'assignment',
            'student',
            'group',
            'file',
            'submitted_at',
            'grade',
            'feedback',
        ]
