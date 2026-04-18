from django.urls import path

from apps.plag_detector.views import SubmissionPlagiarismCohortView

urlpatterns = [
    path(
        "submissions/<uuid:submission_id>/cohort/",
        SubmissionPlagiarismCohortView.as_view(),
        name="plag-cohort-submission",
    ),
]
