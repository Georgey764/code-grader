# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/', include('apps.courses.urls')),  # ✅ points to urls.py
#       path('api/', include('apps.assignments.urls')),
#     path('api/', include('apps.submissions.urls')),
#     path('api/', include('apps.grading.urls')),
# ]



from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.groups.views import GroupViewSet, GroupsMembershipViewSet
from apps.submissions.views import SubmissionViewSet
from apps.assignments.views import AssignmentViewSet, RubricViewSet, TestCaseViewSet, TestResultViewSet

router = DefaultRouter()
router.register(r'groups', GroupViewSet)
router.register(r'group-memberships', GroupsMembershipViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'rubrics', RubricViewSet)
router.register(r'testcases', TestCaseViewSet)
router.register(r'testresults', TestResultViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
