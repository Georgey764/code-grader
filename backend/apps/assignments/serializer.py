from rest_framework import serializers
from .models import Assignment, RubricCriteria, TestCase

class RubricCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricCriteria
        fields = '__all__'

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    rubrics = RubricCriteriaSerializer(many=True, read_only=True)
    test_cases = TestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = Assignment
        fields = '__all__'