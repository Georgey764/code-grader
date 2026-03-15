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
    max_points_allowed = models.IntegerField(default=100)
    is_grouped = models.BooleanField(default=False)

    # Updated fields based on your requirements
    language = models.CharField(
        max_length=10, choices=Language.choices, default=Language.PYTHON
    )
    is_file_input = models.BooleanField(default=False)

    class Meta:
        db_table = "assignment"
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"


class RubricCriteria(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="rubric_criterias"
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
    time_limit = models.IntegerField(help_text="Time limit in seconds", default=300)
    is_hidden = models.BooleanField(default=True)
    points_possible = models.FloatField()

    def __str__(self):
        return f"TestCase {self.id} for Assignment {self.assignment_id}"


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
