# apps/courses/models.py
from django.db import models
from core.models import BaseModel
#from accounts.models import FacultyProfile, StudentProfile
from apps.accounts.models import FacultyProfile, StudentProfile # ✅ Full path


class Course(BaseModel):
    faculty = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=50)
    crn = models.CharField(max_length=5)
    is_active = models.BooleanField(default=True)
    description = models.TextField()

class Roster(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)

class Group(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    max_members = models.PositiveSmallIntegerField()

class GroupsMembership(BaseModel):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    roster = models.ForeignKey(Roster, on_delete=models.CASCADE)
    is_leader = models.BooleanField(default=False)
