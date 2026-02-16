from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubmissionViewSet, RubricResultViewSet, TestResultViewSet

router = DefaultRouter()
router.register(r"submissions", SubmissionViewSet)
router.register(r"rubric-results", RubricResultViewSet)
router.register(r"test-results", TestResultViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
