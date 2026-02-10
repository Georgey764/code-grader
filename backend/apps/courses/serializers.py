from rest_framework import serializers
from apps.core.serializers import BaseSerializers
from apps.courses.models import Course, Roster
from apps.accounts.serializers import FacultySerializer, StudentSerializer
from rest_framework.exceptions import ValidationError


class CourseSerializer(BaseSerializers):
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
    course = CourseSerializer()
    student_profile = StudentSerializer()

    class Meta(BaseSerializers.Meta):
        model = Roster
        fields = "__all__"
