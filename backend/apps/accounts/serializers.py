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

    class Meta:
        model = User
        fields = BaseSerializers.Meta.fields + [
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
        # Remove password_confirm before passing to create_user
        validated_data.pop("password_confirm")

        # Use the create_user method you defined in UserManager
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            role=validated_data.get("role", Roles.STUDENT),
            cwid=validated_data.get("cwid"),
        )

        if validated_data["role"] == Roles.FACULTY:
            FacultyProfile.objects.create(
                user=user,
                phone=validated_data.get("phone"),
                title=validated_data.get("title"),
            )

        elif validated_data["role"] == Roles.STUDENT:
            StudentProfile.objects.create(
                user=user,
                major=validated_data.get("major"),
                classification=validated_data.get("classification"),
            )

        return user


class UserDetailSerializer(BaseSerializers):
    class Meta:
        model = User
        fields = BaseSerializers.Meta.fields + [
            "id",
            "email",
            "first_name",
            "last_name",
            "cwid",
            "role",
        ]


class StudentSerializer(BaseSerializers):
    user = UserDetailSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = BaseSerializers.Meta.fields + [
            "id",
            "user",
            "major",
            "classification",
        ]


class FacultySerializer(BaseSerializers):
    user = UserDetailSerializer(read_only=True)

    class Meta:
        model = FacultyProfile
        fields = BaseSerializers.Meta.fields + [
            "id",
            "user",
            "title",
            "phone",
        ]
