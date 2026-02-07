from apps.core.serializers import BaseSerializers
from rest_framework import serializers
from apps.accounts.models import User

class UserSerializer(BaseSerializers):
    class Meta(BaseSerializers.Meta):
        model = User
        fields=["id", "email", "first_name", "last_name", "role"]
        read_only_fields = BaseSerializers.Meta.read_only_fields + ['role']