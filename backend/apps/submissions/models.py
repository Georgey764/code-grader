from django.db import models
import uuid
from apps.courses.models import Roster
from apps.assignments.models import RubricCriteria, TestCase, Assignment
from apps.groups.models import Group


class Submission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roster = models.ForeignKey(
        Roster, on_delete=models.CASCADE, related_name="submissions"
    )
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="submissions"
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submissions",
    )
    code_submitted = models.TextField()

    def __str__(self):
        return f"Submission by {self.roster} for {self.assignment.name}"

    class Meta:
        db_table = "submission"
        verbose_name = "Submission"
        verbose_name_plural = "Submissions"


class RubricResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="rubric_results"
    )
    rubric_criteria = models.ForeignKey(
        RubricCriteria, on_delete=models.CASCADE, related_name="results"
    )
    points_awarded = models.FloatField()
    optional_feedback = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.rubric_criteria.name}: {self.points_awarded} pts"

    class Meta:
        db_table = "rubricresult"
        verbose_name = "Rubric Result"
        verbose_name_plural = "Rubric Results"
        unique_together = [
            ["submission", "rubric_criteria"]
        ]  # One result per criteria per submission


class TestStatusChoices(models.TextChoices):
    PASS = "PASS", "Pass"
    FAIL = "FAIL", "Fail"
    ERROR = "ERROR", "Error"
    TIMEOUT = "TIMEOUT", "Timeout"
    SKIPPED = "SKIPPED", "Skipped"


class TestResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="test_results"
    )
    test_case = models.ForeignKey(
        TestCase, on_delete=models.CASCADE, related_name="results"
    )
    status = models.CharField(max_length=10, choices=TestStatusChoices.choices)
    actual_output = models.TextField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    execution_time_ms = models.FloatField(null=True, blank=True)
    points_earned = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.test_case} - {self.status}"

    class Meta:
        db_table = "testresult"
        verbose_name = "Test Result"
        verbose_name_plural = "Test Results"
