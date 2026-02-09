from rest_framework import serializers
from .models import Group, GroupsMembership

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'

class GroupsMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupsMembership
        fields = '__all__'