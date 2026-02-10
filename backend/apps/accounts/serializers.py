from apps.core.serializers import BaseSerializers
from rest_framework import serializers
from apps.accounts.models import User, Roles, FacultyProfile, StudentProfile
from django.db import transaction


class RegisterSerializer(BaseSerializers):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=Roles.choices, required=True)
    title = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    major = serializers.CharField(required=False)
    classification = serializers.CharField(
        required=False, allow_null=True, allow_blank=True
    )

    class Meta(BaseSerializers.Meta):
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "role",
            "password",
            "password_confirm",
            "title",
            "phone",
            "cwid",
            "major",
            "classification",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        if attrs["role"] == Roles.FACULTY:
            if not attrs.get("title"):
                raise serializers.ValidationError(
                    {"title": "professor title is required for faculties"}
                )
            if not attrs.get("phone"):
                raise serializers.ValidationError(
                    {"phone": "phone number is required for faculties"}
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("password_confirm")

        title = validated_data.pop("title", None)
        phone = validated_data.pop("phone", None)

        classification = validated_data.pop("classification", None)
        major = validated_data.pop("major", None)

        user = User.objects.create_user(**validated_data)

        if validated_data["role"] == Roles.FACULTY:
            FacultyProfile.objects.create(
                user=user,
                phone=phone,
                title=title,
            )

        elif validated_data["role"] == Roles.STUDENT:
            StudentProfile.objects.create(
                user=user,
                major=major,
                classification=classification,
            )

        return user


class UserDetailSerializer(BaseSerializers):
    class Meta(BaseSerializers.Meta):
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "cwid",
            "role",
        ]


class StudentSerializer(BaseSerializers):
    user = UserDetailSerializer()

    class Meta(BaseSerializers.Meta):
        model = StudentProfile
        fields = [
            "id",
            "user",
            "major",
            "classification",
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        super().update(instance, validated_data)

        if user_data:
            user_instance = instance.user
            for attr, value in user_data.items():
                setattr(user_instance, attr, value)
            user_instance.save()

        return instance


class FacultySerializer(BaseSerializers):
    user = UserDetailSerializer()

    class Meta(BaseSerializers.Meta):
        model = FacultyProfile
        fields = [
            "id",
            "user",
            "title",
            "phone",
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        super().update(instance, validated_data)

        if user_data:
            user_instance = instance.user
            for attr, value in user_data.items():
                setattr(user_instance, attr, value)
            user_instance.save()

        return instance
