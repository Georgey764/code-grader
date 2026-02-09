from django.db import models
from apps.core.models import BaseModel

class Group(BaseModel):
   
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='groups')
    name = models.CharField(max_length=50)
    max_members = models.PositiveSmallIntegerField(default=1)

    def __str__(self):
        return f"{self.name} ({self.course.short_name})"

class GroupsMembership(BaseModel):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    roster = models.ForeignKey('courses.Roster', on_delete=models.CASCADE, related_name='group_memberships')
    is_leader = models.BooleanField(default=False)

    class Meta:
        unique_together = ('group', 'roster') # A student can't join the same group twice