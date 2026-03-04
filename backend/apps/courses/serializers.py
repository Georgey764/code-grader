from rest_framework import serializers
from apps.core.serializers import BaseSerializers
from apps.courses.models import Course, Roster
from apps.accounts.serializers import (
    FacultySerializer,
    StudentSerializer,
)
from apps.accounts.serializers import GradingAssistantSerializer


class CourseSerializer(BaseSerializers):
    faculty_profile = FacultySerializer(read_only=True)
    grading_assistant = GradingAssistantSerializer(read_only=True)
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

    class Meta(BaseSerializers.Meta):
        model = Course
        fields = "__all__"
        read_only_fields = ["faculty_profile"]

    def validate_crn(self, value):
        instance = self.instance

        qs = Course.objects.filter(crn=value)

        if instance:
            qs = qs.exclude(pk=instance.pk)

        if qs.exists():
            raise serializers.ValidationError("CRN must be unique")

        return value


class RosterSerializer(BaseSerializers):
    student_profile = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta(BaseSerializers.Meta):
        model = Roster
        fields = "__all__"
        read_only_fields = ["student_profile", "submissions", "course"]


class RosterAndStudentProfileSerializer(BaseSerializers):
    student_profile = StudentSerializer(read_only=True)

    class Meta(BaseSerializers.Meta):
        model = Roster
        fields = ["student_profile"]
        read_only_fields = ["student_profile"]
