import uuid
from django.db import models
from apps.core.models import BaseModel
from apps.courses.models import Course
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
import re


def validate_name(value):
    if not re.fullmatch(r"[A-Za-z\s\-\,\'\(\)]+", value):
        raise ValidationError(
            "Name must contain only letters, spaces, hyphens, commas, apostrophes, or parentheses."
        )


def validate_deadline(value):
    if value < timezone.now():
        raise ValidationError("Deadline cannot be set in the past.")


class Assignment(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="assignments"
    )
    # Name must contain only letters, spaces, hyphens, commas, apostrophes, or parentheses
    name = models.CharField(
        max_length=255, blank=False, null=False, validators=[validate_name]
    )
    description = models.TextField(blank=True, null=True)
    # Deadline must be set in the future
    deadline = models.DateTimeField(validators=[validate_deadline])
    starter_code = models.TextField(null=True, blank=True)
    # Max of points allowed must be positive
    max_points_allowed = models.IntegerField(
        default=100, validators=[MinValueValidator(0)]
    )
    is_grouped = models.BooleanField(default=False)

    class Meta:
        db_table = "assignment"
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"

    def __str__(self):
        return self.name


class RubricCriteria(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="rubrics"
    )
    # Name must contain only letters, spaces, hyphens, commas, apostrophes, or parentheses
    name = models.CharField(
        max_length=100, blank=False, null=False, validators=[validate_name]
    )
    description = models.TextField(blank=True, null=True)
    # Max points must be positive
    max_points = models.FloatField(validators=[MinValueValidator(0)])

    class Meta:
        db_table = "rubric_criteria"
        verbose_name = "Rubric Criteria"
        verbose_name_plural = "Rubric criteria"

    def clean(self) -> None:
        super().clean()

        # Ensure max points does not exceed assignment's max points allowed
        if self.assignment and self.max_points > self.assignment.max_points_allowed:
            raise ValidationError(
                "Max points for rubric criteria cannot exceed the assignment's max points allowed."
            )

    def __str__(self):
        return f"{self.name} ({self.assignment.name})"


class TestCase(models.Model):
    __test__ = False

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Linked to the Assignment (Foreign Key)
    assignment = models.ForeignKey(
        "Assignment", on_delete=models.CASCADE, related_name="test_cases"
    )

    # Test details
    input_text = models.TextField(blank=True, null=True)
    expected_output = models.TextField(blank=True, null=True)

    # Time limit must be positive
    time_limit = models.IntegerField(
        help_text="Time limit in seconds", validators=[MinValueValidator(1)]
    )

    is_hidden = models.BooleanField(default=True)
    # Points possible must be positive
    points_possible = models.FloatField(validators=[MinValueValidator(0)])

    def clean(self) -> None:
        super().clean()

        # Ensure points possible does not exceed assignment's max points allowed
        if (
            self.assignment
            and self.points_possible > self.assignment.max_points_allowed
        ):
            raise ValidationError(
                "Points possible for test case cannot exceed the assignment's max points allowed."
            )

    def __str__(self):
        return f"TestCase {self.id} for Assignment {self.assignment_id}"
