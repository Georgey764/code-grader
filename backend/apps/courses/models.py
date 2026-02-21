from django.db import models
from apps.core.models import BaseModel
from apps.accounts.models import FacultyProfile, StudentProfile
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
import re
    
# VALIDATORS
def validate_name(value):
    if not re.fullmatch(r"[A-Za-z\s\-]+", value):
        raise ValidationError("Name must contain only letters, spaces, or hyphens.")
    
def validate_short_name(value):
    if not re.fullmatch(r"[A-Za-z0-9\s]+", value):
        raise ValidationError("Short name must contain only letters, numbers or spaces.")

# Create your models here.
class Course(BaseModel):
    faculty_profile = models.ForeignKey(
        FacultyProfile, on_delete=models.CASCADE, related_name="courses"
    )
    name = models.CharField(
        max_length=255, blank=False, null=False, validators=[validate_name]
    )
    short_name = models.CharField(
        max_length=50, blank=False, null=False, validators=[validate_short_name]
    )
    crn = models.IntegerField(
        unique=True, validators=[MinValueValidator(10000), MaxValueValidator(99999)]
    )
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "course"
        verbose_name = "Course"
        verbose_name_plural = "Courses"

    def __str__(self):
        return f"{self.name}"


class Roster(BaseModel):
    student_profile = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="rosters"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="rosters")

    class Meta:
        db_table = "roster"
        verbose_name = "Roster"
        verbose_name_plural = "Rosters"
        constraints = [
            models.UniqueConstraint(
                fields=["student_profile", "course"], name="unique_student_course"
            )
        ]
