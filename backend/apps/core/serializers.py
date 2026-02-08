from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class BaseSerializers(serializers.ModelSerializer):
    class Meta:
        fields = ["id", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = user.role
        token["cwid"] = user.cwid

        return token
