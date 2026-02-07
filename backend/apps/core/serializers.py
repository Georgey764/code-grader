from rest_framework import serializers

class BaseSerializers:
    class Meta:
        read_only_fields = ["id", "created_at", "updated_at"]