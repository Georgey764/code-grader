from django.urls import path

from apps.ai_detector.views import SubmissionAiAnalyzeView

urlpatterns = [
    path(
        "submissions/<uuid:submission_id>/analyze/",
        SubmissionAiAnalyzeView.as_view(),
        name="ai-detector-analyze-submission",
    ),
]
