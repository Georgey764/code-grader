from rest_framework import serializers
from .models import Submission, RubricResult, TestResult

class RubricResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricResult
        fields = '__all__'

class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    rubric_results = RubricResultSerializer(many=True, read_only=True)
    test_results = TestResultSerializer(many=True, read_only=True)

    class Meta:
        model = Submission
        fields = '__all__'