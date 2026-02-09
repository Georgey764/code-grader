from django.db import models
from apps.core.models import BaseModel

class Submission(BaseModel):
    roster = models.ForeignKey('courses.Roster', on_delete=models.CASCADE, related_name='submissions')
    assignment = models.ForeignKey('assignments.Assignment', on_delete=models.CASCADE, related_name='submissions')
    
    group = models.ForeignKey('groups.Group', on_delete=models.SET_NULL, null=True, blank=True, related_name='submissions')
    code_submitted = models.TextField() 
    
    def __str__(self):
        return f"Submission by {self.roster.student} for {self.assignment.name}"

class RubricResult(BaseModel):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='rubric_results')
    rubric_criteria = models.ForeignKey('assignments.RubricCriteria', on_delete=models.CASCADE)
    points_awarded = models.FloatField()
    optional_feedback = models.TextField(blank=True)

class TestResult(BaseModel):
    STATUS_CHOICES = (
        ('PASS', 'Pass'),
        ('FAIL', 'Fail'),
        ('ERROR', 'Error'),
        ('TIMEOUT', 'Timeout'),
        ('SKIPPED', 'Skipped'),
    )

    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='test_results')
    test_case = models.ForeignKey('assignments.TestCase', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    actual_output = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    execution_time_ms = models.FloatField(null=True, blank=True)
    points_earned = models.FloatField(default=0.0)