from django.contrib import admin
from apps.assessments.models import PlagiarismMatch, TestResult, Submission, RubricResult

admin.site.register(TestResult)
admin.site.register(Submission)
admin.site.register(RubricResult)
admin.site.register(PlagiarismMatch)
