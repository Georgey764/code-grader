from django.db import models
import uuid

class BaseModel(models.Model):
    """
    Base model that provides UUID primary keys and timestamps
    for all other models to inherit from.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True  # This means a table won't be created for this model specifically