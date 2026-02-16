import uuid
from django.db import models
from apps.courses.models import Roster
from apps.assignments.models import Assignment, RubricCriteria, TestCase, TestFile
from apps.groups.models import Group


class Submission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # References the student in the course roster
    roster = models.ForeignKey(Roster, on_delete=models.CASCADE)
    # References the specific assignment
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    # Optional field for group-based work
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)
    # Reference to the metadata of the submitted file
    submitted_file = models.OneToOneField(
        TestFile, on_delete=models.PROTECT, related_name="submitted_file"
    )

    def __str__(self):
        return f"Submission {self.id} for {self.assignment.name}"


class RubricResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="rubric_results"
    )
    rubric_criteria = models.ForeignKey(RubricCriteria, on_delete=models.CASCADE)
    points_awarded = models.FloatField()
    optional_feedback = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Rubric {self.rubric_criteria.name}: {self.points_awarded}"


class TestResult(models.Model):
    STATUS_CHOICES = [
        ("PASS", "Pass"),
        ("FAIL", "Fail"),
        ("ERROR", "Error"),
        ("TIMEOUT", "Timeout"),
        ("SKIPPED", "Skipped"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="test_results"
    )
    test_case = models.ForeignKey(TestCase, on_delete=models.CASCADE)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    output_file = models.OneToOneField(
        null=True,
        blank=True,
        related_name="output_file",
        to=TestFile,
        on_delete=models.PROTECT,
    )
    error_message = models.TextField(null=True, blank=True)
    execution_time_ms = models.FloatField()
    points_earned = models.FloatField()

    def __str__(self):
        return f"Test {self.test_case.id}: {self.status}"
