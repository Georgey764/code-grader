from django.urls import path, include
from rest_framework_nested import routers
from apps.assignments.views import (
    AssignmentViewSet,
    RubricViewSet,
    TestCaseViewSet,
    GroupViewSet,
    GroupsMembershipViewSet,
)


app_name = "assignments"

router = routers.DefaultRouter()
router.register(r"", AssignmentViewSet, basename="assignment")

test_case_router = routers.NestedDefaultRouter(router, r"", lookup="assignment")
test_case_router.register(r"test-cases", TestCaseViewSet, basename="testcase")

rubric_criteria_router = routers.NestedDefaultRouter(router, r"", lookup="assignment")
rubric_criteria_router.register(r"rubric-criteria", RubricViewSet, basename="rubric")

group_router = routers.NestedDefaultRouter(router, r"", lookup="assignment")
group_router.register(r"groups", GroupViewSet, basename="group")


urlpatterns = [
    path("", include(router.urls)),
    path("", include(test_case_router.urls)),
    path("", include(rubric_criteria_router.urls)),
    path("", include(group_router.urls)),
]
