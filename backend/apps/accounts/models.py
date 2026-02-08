# apps/accounts/models.py
from django.db import models
from core.models import BaseModel

class User(BaseModel):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    role = models.CharField(max_length=50)
    email = models.EmailField(max_length=255, unique=True)

class FacultyProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)

class StudentProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    major = models.CharField(max_length=255)
    classification = models.CharField(max_length=50)
    cwid = models.BigIntegerField(unique=True)
