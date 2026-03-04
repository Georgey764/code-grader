from django.urls import path, include
from apps.courses.views import CourseModelViewset, RosterModelViewSet
from rest_framework_nested import routers

app_name = "courses"

router = routers.DefaultRouter()
router.register(r"", CourseModelViewset, basename="course")

roster_router = routers.NestedDefaultRouter(router, r"", lookup="course")
roster_router.register(r"rosters", RosterModelViewSet, basename="roster")

urlpatterns = [path("", include(router.urls)), path("", include(roster_router.urls))]
