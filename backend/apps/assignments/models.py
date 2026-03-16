from pyexpat import model
import uuid
from django.db import models
from apps.core.models import BaseModel
from apps.courses.models import Course, Roster


class Assignment(BaseModel):
    # Enum choices for language
    class Language(models.TextChoices):
        PYTHON = "python", "python"
        JAVA = "java", "java"

    # Existing fields...
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="assignments"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    deadline = models.DateTimeField()
    starter_code = models.FileField(upload_to="starter-code/", null=True, blank=True)
    is_grouped = models.BooleanField(default=False)

    # Updated fields based on your requirements
    language = models.CharField(
        max_length=10, choices=Language.choices, default=Language.PYTHON
    )
    is_file_input = models.BooleanField(default=False)

    is_weighted = models.BooleanField(default=False)

    class Meta:
        db_table = "assignment"
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"


class RubricCriteria(BaseModel):  # Assuming BaseModel provides created_at/updated_at
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        "Assignment", on_delete=models.CASCADE, related_name="rubric_criterias"
    )
    name = models.CharField(max_length=100)

    # Diagram shows weight as DECIMAL(5,2)
    weight = models.DecimalField(max_digits=5, decimal_places=2)

    # Detailed descriptions for each point in the 1-5 scale
    desc_one = models.TextField(
        help_text="Description for 1 point", null=True, blank=True
    )
    desc_two = models.TextField(
        help_text="Description for 2 points", null=True, blank=True
    )
    desc_three = models.TextField(
        help_text="Description for 3 points", null=True, blank=True
    )
    desc_four = models.TextField(
        help_text="Description for 4 points", null=True, blank=True
    )
    desc_five = models.TextField(
        help_text="Description for 5 points", null=True, blank=True
    )

    class Meta:
        db_table = "rubric_criteria"
        verbose_name = "Rubric Criteria"
        verbose_name_plural = "Rubric Criterias"

    def __str__(self):
        return f"{self.name} (Weight: {self.weight}%)"


class TestCaseInput(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        # This is where you define the table name or ordering
        db_table = "test_case_inputs"
        verbose_name = "Test Case Input"


class FileInputType(TestCaseInput):
    file_url = models.FileField(upload_to="test_inputs/")

    class Meta:
        db_table = "file_input_types"
        # No need to set abstract=False, it's the default for inheritance!


class TextInputType(TestCaseInput):
    input_text = models.TextField()

    class Meta:
        db_table = "text_input_types"


class TestCase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        "Assignment", on_delete=models.CASCADE, related_name="test_cases"
    )

    # Point to the Base Identity
    test_case_input = models.OneToOneField(
        TestCaseInput, on_delete=models.CASCADE, related_name="test_case"
    )

    expected_output = models.TextField()
    time_limit = models.IntegerField(default=1000)
    is_hidden = models.BooleanField(default=False)

    class Meta:
        db_table = "test_cases"
        ordering = ["-id"]


class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="groups"
    )
    name = models.CharField(max_length=50)
    max_members = models.SmallIntegerField(default=4)

    def __str__(self):
        return f"{self.name} - {self.course.short_name}"

    class Meta:
        db_table = "group"
        verbose_name = "Group"
        verbose_name_plural = "Groups"


class GroupsMembership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="group_memberships"
    )
    roster = models.ForeignKey(
        Roster, on_delete=models.CASCADE, related_name="group_memberships"
    )
    is_leader = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.roster} in {self.group.name}"

    class Meta:
        db_table = "groupsmembership"
        verbose_name = "Group Membership"
        verbose_name_plural = "Group Memberships"
        constraints = [
            models.UniqueConstraint(
                fields=["group", "roster"],
                name="unique_membership",
                violation_error_message="This student is already a member of this group.",
            )
        ]
