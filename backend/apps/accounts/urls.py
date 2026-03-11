from django.urls import path
from .views import (
    UsersCreateView,
    StudentDetailView,
    FacultyDetailView,
    GradingAssistantDetailView,
)

app_name = "accounts"

urlpatterns = [
    path("", UsersCreateView.as_view(), name="user-register"),
    path("student/<str:cwid>/", StudentDetailView.as_view(), name="student-detail"),
    path("faculty/<str:cwid>/", FacultyDetailView.as_view(), name="faculty-detail"),
    path(
        "ga/<str:cwid>/",
        GradingAssistantDetailView.as_view(),
        name="grading-assistant-detail",
    ),
]
