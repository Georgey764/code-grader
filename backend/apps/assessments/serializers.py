from rest_framework import serializers
from apps.accounts.models import Roles
from apps.assessments.models import Submission, RubricResult, TestResult
from apps.assignments.serializers import TestCaseSerializer, RubricCriteriaSerializer
from apps.core.serializers import BaseSerializers


def _submission_student_label(submission):
    try:
        user = submission.roster.student_profile.user
        name = user.get_full_name()
        return name.strip() if name else user.email
    except Exception:
        return str(submission.roster_id)


class RubricResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricResult
        fields = ["id", "submission", "rubric_criteria", "points", "optional_feedback"]

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
    plagiarism_max_score = serializers.SerializerMethodField()
    plagiarism_matches = serializers.SerializerMethodField()
    plagiarism_alert = serializers.SerializerMethodField()

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
            "ai_prediction",
            "plagiarism_max_score",
            "plagiarism_matches",
            "plagiarism_alert",
        ]

    def _faculty_plagiarism_allowed(self):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return request.user.role in (Roles.FACULTY, Roles.GRADING_ASSISTANT)

    def get_plagiarism_max_score(self, obj):
        if not self._faculty_plagiarism_allowed():
            return None
        scores = []
        for m in obj.plagiarism_matches_as_a.all():
            scores.append(m.similarity_score)
        for m in obj.plagiarism_matches_as_b.all():
            scores.append(m.similarity_score)
        if not scores:
            return None
        return round(max(scores) * 100, 1)

    def get_plagiarism_matches(self, obj):
        if not self._faculty_plagiarism_allowed():
            return []
        out = []
        for m in obj.plagiarism_matches_as_a.all():
            other = m.submission_b
            out.append(
                {
                    "other_submission_id": str(other.id),
                    "similarity_percent": round(m.similarity_score * 100, 1),
                    "other_student_label": _submission_student_label(other),
                }
            )
        for m in obj.plagiarism_matches_as_b.all():
            other = m.submission_a
            out.append(
                {
                    "other_submission_id": str(other.id),
                    "similarity_percent": round(m.similarity_score * 100, 1),
                    "other_student_label": _submission_student_label(other),
                }
            )
        out.sort(key=lambda x: -x["similarity_percent"])
        return out

    def get_plagiarism_alert(self, obj):
        if not self._faculty_plagiarism_allowed():
            return False
        return (
            obj.plagiarism_matches_as_a.exists()
            or obj.plagiarism_matches_as_b.exists()
        )
