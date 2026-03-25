import uuid
from django.db import models
from apps.courses.models import Roster
from apps.assignments.models import Assignment, RubricCriteria, TestCase
from apps.assignments.models import Group
from django.db import transaction
from apps.core.models import BaseModel


class Submission(BaseModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        PROCESSED = "PROCESSED", "Processed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # References the student in the course roster
    roster = models.ForeignKey(
        Roster, on_delete=models.CASCADE, related_name="submissions"
    )
    # References the specific assignment
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="submissions"
    )
    # Optional field for group-based work
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)
    # Reference to the metadata of the submitted file
    submitted_file = models.TextField(null=True, blank=True)

    status = models.CharField(
        max_length=50, choices=Status.choices, default=Status.PENDING
    )
    
    # NEW FIELD: Stores the ML model's prediction (e.g., Human, GEMINI, LLAMA)
    ai_prediction = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"Submission {self.id} for {self.assignment.name}"


class RubricResult(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="rubric_results"
    )
    rubric_criteria = models.ForeignKey(
        RubricCriteria, on_delete=models.CASCADE, related_name="rubric_results"
    )

    # Updated to IntegerField with choices to match enum(1,2,3,4,5)
    points = models.DecimalField(max_digits=5, decimal_places=2)

    optional_feedback = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.rubric_criteria.name} - {self.points} Points"

    class Meta:
        db_table = "rubric_result"
        verbose_name = "Rubric Result"
        verbose_name_plural = "Rubric Results"
        constraints = [
            models.UniqueConstraint(
                fields=["submission", "rubric_criteria"],
                name="unique_submission_rubric_criteria",
            )
        ]
        ordering = ["-created_at"]


class TestResult(BaseModel):
    # Using UUID as the primary key as specified in the diagram
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Foreign Key relationships
    # 'Submission' and 'TestCase' should be the names of your other models
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="test_results"
    )
    test_case = models.ForeignKey(
        TestCase, on_delete=models.CASCADE, related_name="test_results"
    )

    # Text fields for standard output and error
    stdout = models.TextField(blank=True, null=True)
    stderr = models.TextField(blank=True, null=True)

    # Exit code (integer 0 or 1)
    exit_code = models.IntegerField(choices=[(0, "Success"), (1, "Failure")])

    # Float fields for duration and points
    duration = models.FloatField(blank=True, null=True)

    # Boolean for success status
    is_success = models.BooleanField(default=False)

    def __str__(self):
        return f"Result for Submission {self.submission_id} - Test {self.test_case_id}"

    @classmethod
    def save_test_results(cls, submission, results):
        # 'results' is the list of dictionaries returned by run_untrusted_python
        try:
            with transaction.atomic():
                test_results_to_create = [
                    cls(
                        submission=submission,
                        test_case_id=item.get("test_case_id", None),
                        stdout=item.get("stdout", ""),
                        stderr=item.get("stderr", ""),
                        exit_code=item.get("exit_code", 1),
                        duration=item.get("duration"),
                        is_success=item.get("is_success", False),
                    )
                    for item in results
                ]
                cls.objects.bulk_create(test_results_to_create)
        except Exception:
            submission.update_test_status(status=Submission.Status.INCOMPLETE)
            submission.save()

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Test Result"
        verbose_name_plural = "Test Results"
        db_table = "test_result"
        constraints = [
            models.UniqueConstraint(
                fields=["submission", "test_case"],
                name="unique_submission_test_case",
            )
        ]
