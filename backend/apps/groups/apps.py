# from django.apps import AppConfig


# class GroupsConfig(AppConfig):
#     name = "apps.groups"
#     label = "groups"

from django.apps import AppConfig

class GroupsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.groups'   # ⚠ Must match your folder structure