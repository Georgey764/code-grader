from django.utils import timezone
from rest_framework import serializers
from apps.assessments.models import Submission, RubricResult, TestResult, PlagiarismMatch
from apps.assignments.models import GroupsMembership
from apps.assignments.serializers import TestCaseSerializer, RubricCriteriaSerializer
from apps.core.serializers import BaseSerializers
from django.db.models import Q


class RubricResultSerializer(serializers.ModelSerializer):
    criteria_name = serializers.CharField(source="rubric_criteria.name", read_only=True)
    max_points = serializers.DecimalField(source="rubric_criteria.max_points", max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = RubricResult
        fields = ["id", "submission", "rubric_criteria", "criteria_name", "max_points", "points", "optional_feedback"]

    def validate_points(self, value):
        """
        Validate that points are within the enum range (1-5).
        """
        rubric_criteria = self.context.get("rubric_criteria") or (
            self.instance.rubric_criteria if self.instance else None
        )
        if rubric_criteria and value > rubric_criteria.max_points:
            raise serializers.ValidationError(
                "Points must be less than or equal to the maximum points."
            )
        return value


class TestResultSerializer(serializers.ModelSerializer):
    test_case = TestCaseSerializer(read_only=True)

    class Meta:
        model = TestResult
        fields = "__all__"


class SubmissionSerializer(BaseSerializers):
    test_results = TestResultSerializer(many=True, read_only=True)
    rubric_results = RubricResultSerializer(many=True, read_only=True)
    plagiarism_matches = serializers.SerializerMethodField()

    def get_plagiarism_matches(self, obj):
        matches = PlagiarismMatch.objects.filter(
            Q(submission_a=obj) | Q(submission_b=obj)
        ).select_related(
            "submission_a__roster__student_profile__user",
            "submission_b__roster__student_profile__user",
        )
        result = []
        for match in matches:
            other = match.submission_b if match.submission_a_id == obj.id else match.submission_a
            try:
                student_name = other.roster.student_profile.user.get_full_name()
            except Exception:
                student_name = "Unknown"
            result.append({
                "matched_submission_id": str(other.id),
                "similarity_score": match.similarity_score,
                "student_name": student_name,
            })
        return result

    class Meta(BaseSerializers.Meta):
        model = Submission
        fields = BaseSerializers.Meta.fields + [
            "id",
            "test_results",
            "roster",
            "assignment",
            "group",
            "submitted_file",
            "status",
            "rubric_results",
            "cross_class_issues",
            "plagiarism_matches",
        ]

    def validate(self, attrs):
        """
        Validate that the submitted file is a valid file.
        """
        assignment = attrs.get("assignment")
        deadline = assignment.deadline
        if deadline < timezone.now():
            raise serializers.ValidationError("Deadline has passed")

        roster = attrs.get("roster")
        group = attrs.get("group")

        if assignment.is_grouped:
            if not group:
                raise serializers.ValidationError(
                    {"group": "Group is required for this assignment."}
                )
            if group.assignment_id != assignment.id:
                raise serializers.ValidationError(
                    {"group": "This group does not belong to this assignment."}
                )
            try:
                membership = GroupsMembership.objects.get(group=group, roster=roster)
            except GroupsMembership.DoesNotExist:
                raise serializers.ValidationError(
                    "You are not a member of the selected group."
                )
            if not membership.is_leader:
                raise serializers.ValidationError(
                    "Only the group leader can submit for this assignment."
                )
        elif group is not None:
            raise serializers.ValidationError(
                {"group": "This assignment is not configured for group submissions."}
            )

        return attrs
