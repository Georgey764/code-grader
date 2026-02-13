from rest_framework import serializers
from apps.core.serializers import BaseSerializers
from apps.courses.models import Course, Roster
from apps.accounts.serializers import StudentSerializer, FacultySerializer


class CourseSerializer(BaseSerializers):
    faculty_profile = FacultySerializer(read_only=True)
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

    def validate(self, attrs):
        return super().validate(attrs)


class RosterSerializer(BaseSerializers):
    student_profile = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta(BaseSerializers.Meta):
        model = Roster
        fields = "__all__"
        read_only_fields = ["student_profile", "course"]
