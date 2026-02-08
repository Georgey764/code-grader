# from django.apps import AppConfig


# class GradingConfig(AppConfig):
#     name = "apps.submissions"
#     label = "submissions"


from django.apps import AppConfig

class SubmissionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.submissions'   # ⚠ Must match your folder structure