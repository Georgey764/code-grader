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
    max_points = serializers.DecimalField(
        source="rubric_criteria.max_points",
        max_digits=5,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = RubricResult
        fields = [
            "criteria_name",
            "points",
            "max_points",
            "weighted_points",
            "optional_feedback",
        ]

    def get_weighted_points(self, obj):
        assignment = obj.submission.assignment

        # If not weighted, this field isn't technically used for the total,
        # but we can return the raw points for clarity.
        if not assignment.is_weighted:
            return float(obj.points)

        # Weighted Logic: (Awarded Points / Max Points) * Weight
        # This ensures that if max_points is 10 and they get 5, they get 50% of the weight.
        try:
            max_pts = float(obj.rubric_criteria.max_points)
            weight = float(obj.rubric_criteria.weight)
            if max_pts == 0:
                return 0
            return round((float(obj.points) / max_pts) * weight, 2)
        except (TypeError, ValueError):
            return 0


class GradebookSubmissionSerializer(serializers.ModelSerializer):
    total_points = serializers.SerializerMethodField()
    rubric_results = GradebookRubricResultSerializer(many=True, read_only=True)
    test_results = TestResultSerializer(many=True, read_only=True)
    test_summary = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            "id",
            "status",
            "total_points",
            "rubric_results",
            "test_results",
            "test_summary",
            "created_at",
            "submitted_file",
        ]

    def get_test_summary(self, obj):
        results = obj.test_results.all()
        return {
            "passed": results.filter(is_success=True).count(),
            "total": results.count(),
        }

    def get_total_points(self, obj):
        assignment = obj.assignment
        results = obj.rubric_results.all()

        if not results.exists():
            return 0

        total_score = 0
        if assignment.is_weighted:
            # Weighted: Sum of normalized percentage * weight
            for result in results:
                max_pts = float(result.rubric_criteria.max_points)
                weight = float(result.rubric_criteria.weight)
                if max_pts > 0:
                    total_score += (float(result.points) / max_pts) * weight
        else:
            # Not Weighted: Simple raw sum of points
            for result in results:
                total_score += float(result.points)

        return round(total_score, 2)
