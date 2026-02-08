from rest_framework import serializers
from .models import Group, GroupsMembership

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'course', 'name', 'max_members']

class GroupsMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupsMembership
        fields = ['id', 'group', 'roster', 'is_leader']
