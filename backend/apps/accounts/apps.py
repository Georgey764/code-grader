# # from django.apps import AppConfig


# # class UsersConfig(AppConfig):
# #     name = "apps.accounts"
# #     label = "accounts"
# from django.apps import AppConfig

# class AccountsConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'apps.accounts'   # ⚠ Must match your folder structure
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts' # This tells Django the physical location
    label = 'accounts'     # This explicitly sets the "App Label" used in step 1