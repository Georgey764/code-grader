from rest_framework import serializers
from apps.core.serializers import BaseSerializers
from apps.courses.models import Course, Roster
from apps.accounts.shared_serializers import (
    FacultySimpleSerializer,
    StudentSimpleSerializer,
)
from apps.assignments.serializers import AssignmentSerializer
from apps.assessments.serializers import SubmissionSerializer


class CourseSerializer(BaseSerializers):
    faculty_profile = FacultySimpleSerializer(read_only=True)
    crn = serializers.IntegerField(
        required=True,
        allow_null=False,
        min_value=10000,
        max_value=99999,
    )
    short_name = serializers.CharField(
        required=True, allow_null=False, allow_blank=False, max_length=50
    )
    is_active = serializers.BooleanField(allow_null=False, default=True)
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta(BaseSerializers.Meta):
        model = Course
        fields = "__all__"
        read_only_fields = ["faculty_profile"]

    def validate_crn(self, value):
        if Course.objects.filter(crn=value).exists():
            raise serializers.ValidationError("CRN must be unique.")
        return value


class RosterSerializer(BaseSerializers):
    student_profile = StudentSimpleSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )
    submissions = SubmissionSerializer(many=True, read_only=True)

    class Meta(BaseSerializers.Meta):
        model = Roster
        fields = "__all__"
        read_only_fields = ["student_profile", "submissions"]
