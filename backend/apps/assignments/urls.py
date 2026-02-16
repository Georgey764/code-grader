from django.urls import path
from .views import (
    AssignmentListView,
    AssignmentDetailView,
    AssignmentCreateView,
    AssignmentUpdateView,
    AssignmentDeleteView,
    AssignmentByCourseView,
    AssignmentStatsView,
    CloneAssignmentView,
    RubricCriteriaListCreateView,
    RubricCriteriaDetailView,
    TestCaseListCreateView,
    TestCaseDetailView,
    PublicTestCasesView,
)

app_name = "assignments"

urlpatterns = [
    # Assignment URLs
    path("", AssignmentListView.as_view(), name="assignment-list"),
    path("create/", AssignmentCreateView.as_view(), name="assignment-create"),
    path("<uuid:id>/", AssignmentDetailView.as_view(), name="assignment-detail"),
    path("<uuid:id>/update/", AssignmentUpdateView.as_view(), name="assignment-update"),
    path("<uuid:id>/delete/", AssignmentDeleteView.as_view(), name="assignment-delete"),
    path("<uuid:id>/stats/", AssignmentStatsView.as_view(), name="assignment-stats"),
    path("<uuid:id>/clone/", CloneAssignmentView.as_view(), name="assignment-clone"),
    # Course-specific assignments
    path(
        "course/<uuid:course_id>/",
        AssignmentByCourseView.as_view(),
        name="assignment-by-course",
    ),
    # Rubric URLs
    path(
        "<uuid:assignment_id>/rubrics/",
        RubricCriteriaListCreateView.as_view(),
        name="rubric-list-create",
    ),
    path(
        "rubrics/<uuid:id>/", RubricCriteriaDetailView.as_view(), name="rubric-detail"
    ),
    # Test Case URLs
    path(
        "<uuid:assignment_id>/test-cases/",
        TestCaseListCreateView.as_view(),
        name="testcase-list-create",
    ),
    path(
        "<uuid:assignment_id>/test-cases/public/",
        PublicTestCasesView.as_view(),
        name="testcase-public",
    ),
    path("test-cases/<uuid:id>/", TestCaseDetailView.as_view(), name="testcase-detail"),
]
