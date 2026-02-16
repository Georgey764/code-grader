from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, RubricViewSet, TestCaseViewSet, TestFileViewSet

app_name = "assignments"


router = DefaultRouter()
router.register(r"test-files", TestFileViewSet, basename="testfile")
router.register(r"test-cases", TestCaseViewSet, basename="testcase")
router.register(r"", AssignmentViewSet, basename="assignment")

urlpatterns = [
    # Standard CRUD + Stats + Clone (handled by Router & Actions)
    path("", include(router.urls)),
    # Nested resources for specific Assignments
    # path(
    #     "<uuid:assignment_id>/",
    #     include(
    #         [
    #             path(
    #                 "rubrics/",
    #                 RubricViewSet.as_view({"get": "list", "post": "create"}),
    #                 name="assignment-rubrics",
    #             ),
    #             path(
    #                 "test-cases/",
    #                 TestCaseViewSet.as_view({"get": "list", "post": "create"}),
    #                 name="assignment-testcases",
    #             ),
    #         ]
    #     ),
    # ),
    # Direct access to children
    path(
        "rubrics/<uuid:id>/",
        RubricViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"},
        ),
        name="rubric-detail",
    ),
]
