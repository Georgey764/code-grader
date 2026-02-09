from django.db import models
from apps.core.models import BaseModel
from apps.courses.models import Course

class Assignment(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    name = models.CharField(max_length=255)
    description = models.TextField()
    deadline = models.DateTimeField()
    starter_code = models.TextField(blank=True)
    max_points_allowed = models.IntegerField()
    is_grouped = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class RubricCriteria(BaseModel):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='rubrics')
    name = models.CharField(max_length=100)
    description = models.TextField()
    max_points = models.FloatField()
    is_automated = models.BooleanField(default=False)

class TestCase(BaseModel):
    TEST_TYPE_CHOICES = (
        ('UNIT', 'Unit Test'),
        ('RUN', 'Run Test'),
        ('SINGLE', 'Single Data'),
        ('FULL', 'Full Data Suite'),
    )
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='test_cases')
    test_type = models.CharField(max_length=10, choices=TEST_TYPE_CHOICES)
    input_data = models.TextField(blank=True)
    expected_output = models.TextField(blank=True)
    is_public = models.BooleanField(default=True) 
    weight = models.DecimalField(max_digits=5, decimal_places=2)