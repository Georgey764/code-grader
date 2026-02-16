from django.db import models
import uuid
from apps.courses.models import Roster
from apps.assignments.models import Assignment


class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
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
        Group, on_delete=models.CASCADE, related_name="memberships"
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
        unique_together = [["group", "roster"]]  # Prevent duplicate memberships
