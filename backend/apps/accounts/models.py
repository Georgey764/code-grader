from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.core.models import BaseModel

class User(AbstractUser, BaseModel):
    """
    Custom User model extending Django's built-in auth.
    We use the 'role' field from your ERD.
    """
    ROLE_CHOICES = (
        ('ADMIN', 'Administrator'),
        ('FACULTY', 'Faculty'),
        ('STUDENT', 'Student'),
    )
    
   
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    
class FacultyProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    title = models.CharField(max_length=50)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Prof. {self.user.last_name}"

class StudentProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    major = models.CharField(max_length=255)
    classification = models.CharField(max_length=50) # e.g., Senior, Junior
    cwid = models.BigIntegerField(unique=True) # Campus Wide ID

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"