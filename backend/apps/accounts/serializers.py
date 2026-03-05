from apps.core.serializers import BaseSerializers
from rest_framework import serializers
from apps.accounts.models import User, Roles, FacultyProfile, StudentProfile
from django.db import transaction
from phonenumber_field.phonenumber import to_python
from apps.courses.serializers import RosterSerializer, CourseSerializer
import re

def validate_name(value):
    # Name should be at least 2 characters long and no more than 50 characters
    length = len(value)
    if length < 2 or length > 50:
        raise serializers.ValidationError("Name must be at least 2 characters long and no more than 50 characters.")

    # Checks if the name contains a letter, eliminates names that are only hyphens, apostrophes, and/or spaces
    if not re.search(r"[a-zA-Z]", value):
        raise serializers.ValidationError("Name must contain at least one letter.")
    
    # Name should only contain letters, spaces, hyphens, and apostrophes
    if not re.match(r"^[a-zA-Z\s'-]+$", value):
        raise serializers.ValidationError(
            "Name can only contain letters, spaces, hyphens, and apostrophes."
        )

    # Name cannot have consecutive hyphens, apostrophes, or spaces
    if re.search(r"(--|''|\s\s)", value):
        raise serializers.ValidationError(
            "Name cannot have consecutive hyphens, apostrophes, or spaces."
        )

    return value

class RegisterSerializer(BaseSerializers):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=Roles.choices, required=True)
    title = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    major = serializers.CharField(required=False)
    classification = serializers.CharField(required=False)

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

    def validate_password(self, value):
        # Must be at least 8 characters
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        # Must only contain ASCII characters
        if not value.isascii():
            raise serializers.ValidationError("Password must only contain ASCII characters.")

        # Must contain an uppercase letter
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        # Must contain a lowercase letter
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        
        # Must contain a number
        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Password must contain at least one number.")
        
        # Must contain a special character
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        
        return value

    def validate_cwid(self, value):
        # CWID must be a number
        if not value.isdigit():
            print(f"Invalid CWID: {value} is not a number.")
            raise serializers.ValidationError("CWID must contain only digits.")
        
        # CWID must be between 8 and 10 digits long
        if len(value) < 8 or len(value) > 10:
            print(f"Invalid CWID: {value} does not have a valid length.")
            raise serializers.ValidationError("CWID must be between 8 and 10 digits long.")
        
        # CWID must be positive
        if int(value) < 0:
            print(f"Invalid CWID: {value} is not a positive number.")
            raise serializers.ValidationError("CWID must be a positive number.")

        return value

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
        read_only_fields = ["role"]
        # extra_kwargs = {
        #     "cwid": {"validators": []},
        #     "email": {"validators": []},
        # }
        # read_only_fields = ["email", "cwid"]

    def validate_email(self, attrs):
        user = self.instance
        qs = User.objects.filter(email__iexact=attrs)
        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return attrs

    def validate_cwid(self, attrs):
        user = self.instance
        qs = User.objects.filter(cwid__iexact=attrs)
        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError("A user with this cwid already exists.")
        return attrs

    first_name = serializers.CharField(validators=[validate_name])
    last_name = serializers.CharField(validators=[validate_name])

class StudentSerializer(BaseSerializers):
    user = UserDetailSerializer()
    rosters = RosterSerializer(many=True, read_only=True)

    class Meta(BaseSerializers.Meta):
        model = StudentProfile
        fields = ["id", "user", "major", "classification", "rosters"]

    def to_internal_value(self, data):
        # This runs BEFORE is_valid()
        # We manually inject the user instance into the nested serializer
        if self.instance and hasattr(self.instance, "user"):
            self.fields["user"].instance = self.instance.user
        return super().to_internal_value(data)

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        super().update(instance, validated_data)
        if user_data:
            user_serializer = UserDetailSerializer(
                instance.user, data=user_data, partial=True
            )
            user_serializer.is_valid(raise_exception=True)
            user_serializer.save()
        return instance


class FacultySerializer(BaseSerializers):
    user = UserDetailSerializer()
    courses = CourseSerializer(many=True, read_only=True)

    class Meta(BaseSerializers.Meta):
        model = FacultyProfile
        fields = ["id", "user", "title", "phone", "courses"]

    def to_internal_value(self, data):
        # This runs BEFORE is_valid()
        # We manually inject the user instance into the nested serializer
        if self.instance and hasattr(self.instance, "user"):
            self.fields["user"].instance = self.instance.user
        return super().to_internal_value(data)

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        super().update(instance, validated_data)
        if user_data:
            user_serializer = UserDetailSerializer(
                instance.user, data=user_data, partial=True
            )
            user_serializer.is_valid(raise_exception=True)
            user_serializer.save()
        return instance

    def validate_phone(self, value):
        phone_obj = to_python(value, region="US")

        if not phone_obj or not phone_obj.is_valid():
            raise serializers.ValidationError("Please provide a valid US phone number.")

        return phone_obj.as_e164
