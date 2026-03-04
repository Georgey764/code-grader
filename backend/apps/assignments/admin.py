from django.contrib import admin
from apps.assignments.models import (
    TestCase,
    RubricCriteria,
    Assignment,
    GroupsMembership,
    Group,
)

# Register your models here.
admin.site.register(TestCase)
admin.site.register(RubricCriteria)
admin.site.register(Assignment)
admin.site.register(Group)
admin.site.register(GroupsMembership)
