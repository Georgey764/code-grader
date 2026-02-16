import uuid
from django.db import models
from apps.core.models import BaseModel
from apps.courses.models import Course


class Assignment(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="assignments"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    deadline = models.DateTimeField()
    starter_code = models.TextField(blank=True, null=True)
    max_points_allowed = models.IntegerField(default=100)
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
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    max_points = models.FloatField()

    class Meta:
        db_table = "rubric_criteria"
        verbose_name = "Rubric Criteria"
        verbose_name_plural = "Rubric criteria"

    def __str__(self):
        return f"{self.name} ({self.assignment.name})"


class TestCase(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="test_cases"
    )
    input_data = models.TextField(blank=True, null=True)
    expected_output = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=True)
    weight = models.DecimalField(max_digits=3, decimal_places=2)

    class Meta:
        db_table = "test_case"
        verbose_name = "Test Case"
        verbose_name_plural = "Test Cases"

    def __str__(self):
        return f"{self.test_type} test for {self.assignment.name}"
