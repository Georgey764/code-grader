from django.db import models
from apps.courses.model import Course
from apps.accounts.model import StudentProfile

#model for group
class Group(models.Model):
    #name of team
    name = models.CharField(max_length=50)
    
    #link to the class
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='groups')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.course.short_name})"
     

#model for group membership