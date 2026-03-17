from rest_framework import serializers
from apps.core.serializers import BaseSerializers
from apps.courses.models import Course, Roster
from apps.accounts.serializers import (
    FacultySerializer,
    StudentSerializer,
)
from apps.accounts.serializers import GradingAssistantSerializer
import re

def validate_short_name(value):
    # Short name must be between 3 and 50 characters
    length = len(value)
    if length < 3 or length > 50:
        raise serializers.ValidationError(
            "Short name must be between 3 and 50 characters"
        )
    
    # Short name must contain only alphanumeric characters and spaces
    if not re.match(r'^[a-zA-Z0-9 ]+$', value):
        raise serializers.ValidationError(
            "Short name can only contain alphanumeric characters and spaces"
        )
    
    # No consecutive spaces allowed
    if '  ' in value:
        raise serializers.ValidationError(
            "Short name cannot contain consecutive spaces"
        )

    # Must only contain ASCII characters
    if not value.isascii():
        raise serializers.ValidationError("Short name must only contain ASCII characters.")
    
    return value

def validate_name(value):
    # Name must be between 1 and 255 characters
    length = len(value)
    if length < 1 or length > 255:
        raise serializers.ValidationError(
            "Name must be between 1 and 255 characters"
        )
    
    # Name must contain only alphabetic characters, spaces, and hyphens
    if not re.match(r"^[a-zA-Z '-]+$", value):
        raise serializers.ValidationError(
            "Name can only contain alphabetic characters, spaces, hyphens, and apostrophes"
        )
    
    # No consecutive spaces, hyphens, or apostrophes allowed
    if '--' in value or "''" in value or '  ' in value:
        raise serializers.ValidationError(
            "Name cannot contain consecutive spaces, hyphens, or apostrophes"
        )

    # Must only contain ASCII characters
    if not value.isascii():
        raise serializers.ValidationError("Name must only contain ASCII characters.")
    
    return value

def validate_description(value):
    # Description must be at most 1000 characters
    length = len(value)
    if length > 1000:
        raise serializers.ValidationError(
            "Description must be at most 1000 characters"
        )
    
    # Must only contain ASCII characters
    if not value.isascii():
        raise serializers.ValidationError("Description must only contain ASCII characters.")
    
    # No HTML tags allowed
    if re.search(r'<[^>]+>', value):
        raise serializers.ValidationError("Description cannot contain HTML tags.")
    
    return value

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
        required=True, allow_null=False, allow_blank=False, max_length=50, validators=[validate_short_name]
    )
    name = serializers.CharField(
        required=True, allow_null=False, allow_blank=False, max_length=255, validators=[validate_name]
    )
    description = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, validators=[validate_description]
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
