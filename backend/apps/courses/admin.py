from django.contrib import admin
from apps.courses.models import Course, Roster

# Register your models here.
admin.site.register(Course)
admin.site.register(Roster)
