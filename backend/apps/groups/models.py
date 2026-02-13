from django.db import models
from apps.core.models import BaseModel
from apps.courses.models import Course
from apps.accounts.models import StudentProfile


# creating model for group
class Group(BaseModel):
    name = models.CharField(max_length=50)

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="groups")

    class Meta:
        # setting the daabase table name for group model
        db_table = "group"
        verbose_name = "Group"
        verbose_name_plural = "Groups"

    def __str__(self):
        return f"{self.name} - {self.course.short_name}"


# creating model for group members
class GroupMembership(BaseModel):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="member")

    student = models.OneToOneField(
        StudentProfile, on_delete=models.CASCADE, related_name="group_memberships"
    )

    class Meta:
        db_table = "group_membership"
        verbose_name = "Group Membership"
        verbose_name_plural = "Group Memberships"
        # prevets adding the same student to the same group more than once
        unique_together = ("group", "student")

    def __str__(self):
        return f"{self.student.user.first_name} in {self.group.name}"
