import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("config")

# Load config from settings.py using the 'CELERY' namespace
app.config_from_object("django.conf:settings", namespace="CELERY")

# Look for tasks.py in all installed apps
app.autodiscover_tasks()
