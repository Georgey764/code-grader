# apps/assignments/models.py
from django.db import models
from core.models import BaseModel
from apps.courses.models import Course, Roster
# Note: Group is likely in apps.groups, not courses!
# Check where your Group model is. If it's in apps/groups/models.py:
from apps.groups.models import Group

class Assignment(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    deadline = models.DateTimeField()
    starter_code = models.TextField(blank=True)
    max_points_allowed = models.IntegerField()
    is_grouped = models.BooleanField(default=False)

class Submission(BaseModel):
    roster = models.ForeignKey(Roster, on_delete=models.CASCADE)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True)
    code_submitted = models.TextField()
