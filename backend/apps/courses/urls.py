# apps/courses/urls.py
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, RosterViewSet, GroupViewSet, GroupsMembershipViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'rosters', RosterViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'group-memberships', GroupsMembershipViewSet)

urlpatterns = router.urls
