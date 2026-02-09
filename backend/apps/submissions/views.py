from rest_framework import viewsets
from .models import Submission, RubricResult, TestResult
from .serializer import SubmissionSerializer, RubricResultSerializer, TestResultSerializer

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

class RubricResultViewSet(viewsets.ModelViewSet):
    queryset = RubricResult.objects.all()
    serializer_class = RubricResultSerializer

class TestResultViewSet(viewsets.ModelViewSet):
    queryset = TestResult.objects.all()
    serializer_class = TestResultSerializer