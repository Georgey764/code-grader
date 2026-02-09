from rest_framework import viewsets
from .models import Assignment, RubricCriteria, TestCase
from .serializer import AssignmentSerializer, RubricCriteriaSerializer, TestCaseSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

class RubricCriteriaViewSet(viewsets.ModelViewSet):
    queryset = RubricCriteria.objects.all()
    serializer_class = RubricCriteriaSerializer

class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer