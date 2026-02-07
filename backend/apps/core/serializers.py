from rest_framework import serializers


class BaseSerializers(serializers.ModelSerializer):
    class Meta:
        read_only_fields = ["id", "created_at", "updated_at"]
