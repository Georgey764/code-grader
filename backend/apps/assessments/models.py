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
        COMPLETE = "COMPLETE", "Complete"
        INCOMPLETE = "INCOMPLETE", "Incomplete"

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
    submitted_file = models.FileField(upload_to="submissions/")

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )

    def __str__(self):
        return f"Submission {self.id} for {self.assignment.name}"

    class Meta:
        db_table = "submission"
        verbose_name = "submission"
        verbose_name_plural = "submissions"

    def update_test_status(self, status):
        """
        Logic to handle the results dictionary and save to DB
        """
        self.status = status
        self.save()


class RubricResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="rubric_results"
    )
    rubric_criteria = models.ForeignKey(
        RubricCriteria, on_delete=models.CASCADE, related_name="rubric_results"
    )
    points_awarded = models.FloatField()
    optional_feedback = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Rubric {self.rubric_criteria.name}: {self.points_awarded}"

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


class TestResult(models.Model):
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
                submission.update_test_status(status=Submission.Status.COMPLETE)
        except Exception:
            submission.update_test_status(status=Submission.Status.INCOMPLETE)
            raise
