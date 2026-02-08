from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from apps.accounts.models import User, FacultyProfile, StudentProfile

# Register your models here.
# admin.site.register(User, UserAdmin)
admin.site.register(FacultyProfile)
admin.site.register(StudentProfile)
