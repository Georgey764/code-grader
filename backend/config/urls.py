from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Accounts Imports
from apps.accounts.views import UserViewSet, FacultyProfileViewSet, StudentProfileViewSet

# Courses Imports
from apps.courses.views import CourseViewSet, RosterViewSet

# Assignments Imports 
from apps.assignments.views import AssignmentViewSet, RubricCriteriaViewSet, TestCaseViewSet

#  Groups Imports
from apps.groups.views import GroupViewSet, GroupsMembershipViewSet

#  Submissions Imports (TestResult is here now)
from apps.submissions.views import SubmissionViewSet, RubricResultViewSet, TestResultViewSet

router = DefaultRouter()

# Register Accounts
router.register(r'users', UserViewSet)
router.register(r'faculty', FacultyProfileViewSet)
router.register(r'students', StudentProfileViewSet)

# Register Courses
router.register(r'courses', CourseViewSet)
router.register(r'rosters', RosterViewSet)

# Register Assignments
router.register(r'assignments', AssignmentViewSet)
router.register(r'rubrics', RubricCriteriaViewSet)
router.register(r'test-cases', TestCaseViewSet)

# Register Groups
router.register(r'groups', GroupViewSet)
router.register(r'group-memberships', GroupsMembershipViewSet)

# Register Submissions
router.register(r'submissions', SubmissionViewSet)
router.register(r'rubric-results', RubricResultViewSet)
router.register(r'test-results', TestResultViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]