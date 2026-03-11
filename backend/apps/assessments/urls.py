from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.assessments.views import (
    SubmissionViewSet,
    RubricResultViewSet,
)

router = DefaultRouter()
router.register(r"submissions", SubmissionViewSet, basename="submission")
router.register(r"rubric-results", RubricResultViewSet, basename="rubricresult")

urlpatterns = [
    path("", include(router.urls)),
]
