from django.contrib import admin
from apps.assignments.models import TestCase, RubricCriteria, Assignment

# Register your models here.
admin.site.register(TestCase)
admin.site.register(RubricCriteria)
admin.site.register(Assignment)
