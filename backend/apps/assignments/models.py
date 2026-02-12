from django.db import models
from apps.core.model import BaseModel
from apps.courses.models import Course

class Assignment(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    total_points = models.IntegerField(default=100)
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    
    class Meta:
        db_table = 'assignments'
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'
        ordering = ['due_date ']
        
        def __str__(self):
            return f"{self.title} - {self.course.short_name}"
        
#model for RubricCriteria
class RubricCriteria(BaseModel):
     description = models.CharField(max_length=255)
     max_points = models.IntegerField(default=10)
     assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='rubrics')
     
     class Meta:
            db_table = 'rubric_criteria'
            verbose_name = 'Rubric Criteria'
            verbose_name_plural = 'Rubric Criteria'
    
            def __str__(self):
                     return f"{self.description} - {self.max_points} points"
                 

     