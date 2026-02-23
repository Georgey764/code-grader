from django.urls import path
from apps.courses.views import CourseModelViewset, RosterModelViewSet

app_name = "courses"

urlpatterns = [
    path(
        "",
        CourseModelViewset.as_view({"post": "create", "get": "list"}),
        name="course-list",
    ),
    path(
        "<uuid:pk>/",
        CourseModelViewset.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="course-detail",
    ),
    path(
        "roster/<uuid:pk>",
        RosterModelViewSet.as_view({"delete": "destroy"}),
        name="roster-destroy",
    ),
    path(
        "roster/",
        RosterModelViewSet.as_view({"get": "list", "post": "create"}),
        name="roster-create",
    ),
]
