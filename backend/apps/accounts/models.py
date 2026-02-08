from django.db import models
from apps.core.models import BaseModel
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.auth.base_user import BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError


# Create your models here.
class Roles(models.TextChoices):
    FACULTY = "FA", "Faculty"
    STUDENT = "ST", "Student"


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser, BaseModel):
    username = None

    email = models.EmailField(unique=True, null=False, blank=False)
    first_name = models.CharField(max_length=50, unique=False, null=False, blank=False)
    last_name = models.CharField(max_length=50, unique=False, null=False, blank=False)
    role = models.CharField(max_length=2, choices=Roles.choices, default=Roles.STUDENT)
    cwid = models.CharField(max_length=10, unique=True, null=False, blank=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]
    objects = UserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email


class FacultyProfile(BaseModel):
    user = models.OneToOneField(
        "User",
        on_delete=models.CASCADE,
        related_name="faculty_profile",
    )
    title = models.CharField(max_length=50, unique=False)
    phone = PhoneNumberField(region="US")

    class Meta:
        db_table = "faculty_profile"
        verbose_name = "Faculty Profile"
        verbose_name_plural = "Faculty Profiles"

    def clean(self):
        if self.user and self.user.role != Roles.FACULTY:
            raise ValidationError(
                f"User with email {self.user.email} is not a faculty."
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.first_name} - {self.user.cwid}"


class StudentProfile(BaseModel):
    user = models.OneToOneField(
        "User",
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    major = models.CharField(max_length=255, unique=False, null=True, blank=True)
    classification = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = "student_profile"
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"

    def clean(self):
        if not self.user or self.user.role != Roles.STUDENT:
            raise ValidationError(
                f"User with the email {self.user.email} is not a student"
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.first_name} - {self.user.cwid}"
