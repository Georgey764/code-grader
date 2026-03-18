from rest_framework import serializers
from apps.assessments.models import RubricResult, Submission
from apps.assessments.serializers import TestResultSerializer
from apps.core.serializers import BaseSerializers
from apps.courses.models import Course, Roster
from apps.accounts.serializers import (
    FacultySerializer,
    StudentSerializer,
)
from apps.accounts.serializers import GradingAssistantSerializer


class CourseSerializer(BaseSerializers):
    faculty_profile = FacultySerializer(read_only=True)
    grading_assistant = GradingAssistantSerializer(read_only=True)
    crn = serializers.IntegerField(
        required=True,
        allow_null=False,
        min_value=10000,
        max_value=99999,
    )
    short_name = serializers.CharField(
        required=True, allow_null=False, allow_blank=False, max_length=50
    )
    is_active = serializers.BooleanField(allow_null=False, default=True)

    class Meta(BaseSerializers.Meta):
        model = Course
        fields = "__all__"
        read_only_fields = ["faculty_profile"]

    def validate_crn(self, value):
        instance = self.instance

        qs = Course.objects.filter(crn=value)

        if instance:
            qs = qs.exclude(pk=instance.pk)

        if qs.exists():
            raise serializers.ValidationError("CRN must be unique")

        return value


class RosterSerializer(BaseSerializers):
    student_profile = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta(BaseSerializers.Meta):
        model = Roster
        fields = "__all__"
        read_only_fields = ["student_profile", "submissions", "course"]


class RosterAndStudentProfileSerializer(BaseSerializers):
    student_profile = StudentSerializer(read_only=True)

    class Meta(BaseSerializers.Meta):
        model = Roster
        fields = ["student_profile"]
        read_only_fields = ["student_profile"]


# FOR GRADES VIEW BELOW HERE


class GradebookRubricResultSerializer(serializers.ModelSerializer):
    weighted_points = serializers.SerializerMethodField()
    criteria_name = serializers.CharField(source="rubric_criteria.name", read_only=True)

    class Meta:
        model = RubricResult
        fields = ["criteria_name", "points", "weighted_points", "optional_feedback"]

    def get_weighted_points(self, obj):
        assignment = obj.submission.assignment
        # Apply the same logic: check if parent assignment is weighted
        if assignment.is_weighted:
            weight = float(obj.rubric_criteria.weight)
        else:
            total_count = assignment.rubric_criterias.count()
            weight = 100.0 / total_count if total_count > 0 else 0

        return round((obj.points / 5) * weight, 2)


class GradebookSubmissionSerializer(serializers.ModelSerializer):
    total_points = serializers.SerializerMethodField()
    rubric_results = GradebookRubricResultSerializer(many=True, read_only=True)
    # Adding the autograder results here
    test_results = TestResultSerializer(many=True, read_only=True)
    test_summary = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            "id",
            "status",
            "total_points",
            "rubric_results",
            "test_results",  # Full list of test outcomes
            "test_summary",  # Quick pass/fail count
            "created_at",
        ]

    def get_test_summary(self, obj):
        """Returns a quick overview of autograder performance"""
        results = obj.test_results.all()  # Assuming related_name="test_results"
        return {
            "passed": results.filter(is_success=True).count(),
            "total": results.count(),
        }

    def get_total_points(self, obj):
        # ... (same weighted/unweighted logic as before) ...
        assignment = obj.assignment
        results = obj.rubric_results.all()
        if not results.exists():
            return 0

        total_score = 0
        if assignment.is_weighted:
            for result in results:
                total_score += (result.points / 5) * float(
                    result.rubric_criteria.weight
                )
        else:
            total_count = assignment.rubric_criterias.count()
            if total_count == 0:
                return 0
            equal_weight = 100.0 / total_count
            for result in results:
                total_score += (result.points / 5) * equal_weight
        return round(total_score, 2)
