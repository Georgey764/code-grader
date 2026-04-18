from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class BaseSerializers(serializers.ModelSerializer):
    class Meta:
        fields = ["created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = user.role
        token["cwid"] = user.cwid

        return token

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")
        if email and password:
            User = get_user_model()
            user = User.objects.filter(email=email).first()
            if user and not user.is_active and user.check_password(password):
                raise AuthenticationFailed(
                    "INACTIVE_ACCOUNT: This account has not been activated yet. "
                    "Use “Resend activation email” on this page, or open the latest "
                    "link from your inbox."
                )

        data = super().validate(attrs)

        data["role"] = self.user.role
        data["cwid"] = self.user.cwid
        data["email"] = self.user.email

        return data
