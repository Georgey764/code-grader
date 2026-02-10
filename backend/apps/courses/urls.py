from django.urls import path
from apps.courses.views import CourseModelViewset


urlpatterns = [
    path(
        "",
        CourseModelViewset.as_view({"get": "list", "post": "create"}),
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
]
