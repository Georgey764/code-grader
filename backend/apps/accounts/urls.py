from django.urls import path
from .views import UsersCreateView, StudentDetailView, FacultyDetailView

urlpatterns = [
    path("", UsersCreateView.as_view(), name="user-register"),
    path("student/<str:cwid>/", StudentDetailView.as_view(), name="student-detail"),
    path("faculty/<str:cwid>/", FacultyDetailView.as_view(), name="faculty-detail"),
]
