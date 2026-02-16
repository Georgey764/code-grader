from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubmissionViewSet, RubricResultViewSet, TestResultViewSet

router = DefaultRouter()
router.register(r"submissions", SubmissionViewSet, basename="submission")
router.register(r"rubric-results", RubricResultViewSet, basename="rubricresult")
router.register(r"test-results", TestResultViewSet, basename="testresult")

urlpatterns = [
    path("", include(router.urls)),
]
