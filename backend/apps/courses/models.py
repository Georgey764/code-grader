from django.db import models
from apps.core.models import BaseModel
from apps.accounts.models import FacultyProfile, StudentProfile
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here.
class Course(BaseModel):
    faculty_profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=50)
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


class Roster:
    student_profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    facult_profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE)

    class Meta:
        db_table = "roster"
        verbose_name = "Roster"
        verbose_name_plural = "Rosters"
