from django.db import models
from apps.core.models import BaseModel
from apps.accounts.models import FacultyProfile, StudentProfile

class Course(BaseModel):
    faculty = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=50) 
    crn = models.CharField(max_length=5, blank=True) 
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.short_name}: {self.name}"

class Roster(BaseModel):
    """
    Links a Student to a Course.
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='roster')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='enrollments')

    class Meta:
        unique_together = ('course', 'student') # A student can't be in the same course twice