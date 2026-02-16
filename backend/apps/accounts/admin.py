from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from apps.accounts.models import User, FacultyProfile, StudentProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # 1. Fix the ordering error by pointing to 'email'
    ordering = ("email",)

    # 2. Update list_display to show relevant fields
    list_display = ("email", "first_name", "last_name", "role", "cwid", "is_staff")

    # 3. Update search and filters
    search_fields = ("email", "first_name", "last_name", "cwid")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")

    # 4. Redefine fieldsets because default BaseUserAdmin expects 'username'
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "cwid", "role")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # 5. Redefine add_fieldsets for the 'Create User' form
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "cwid",
                    "role",
                    "password",
                ),
            },
        ),
    )


# Register profiles as well
admin.site.register(FacultyProfile)
admin.site.register(StudentProfile)
