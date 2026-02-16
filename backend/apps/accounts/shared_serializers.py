from apps.core.serializers import BaseSerializers
from rest_framework import serializers
from apps.accounts.models import FacultyProfile, StudentProfile


class StudentSimpleSerializer(BaseSerializers):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta(BaseSerializers.Meta):
        model = StudentProfile
        fields = ["id", "major", "first_name", "last_name"]


class FacultySimpleSerializer(BaseSerializers):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta(BaseSerializers.Meta):
        model = FacultyProfile
        fields = ["id", "title", "first_name", "last_name"]
