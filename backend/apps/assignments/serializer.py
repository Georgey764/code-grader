# apps/assignments/serializers.py
from rest_framework import serializers
from .models import Assignment, Rubric, TestCase, TestResult

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'course', 'name', 'description', 'due_date']

class RubricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubric
        fields = ['id', 'assignment', 'criteria', 'max_score']

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'assignment', 'input_data', 'expected_output']

class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['id', 'submission', 'test_case', 'status', 'output', 'score']
