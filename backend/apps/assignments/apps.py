# from django.apps import AppConfig


# class AssessmentsConfig(AppConfig):
#     name = "apps.assignments"
#     label = "assignments"
from django.apps import AppConfig

class AssignmentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.assignments'   # ⚠ Must match your folder structure
