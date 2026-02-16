from apps.courses.tests.factories import CourseFactory, RosterFactory
import pytest


@pytest.fixture
def course(db, faculty_user):
    return CourseFactory(instructor=faculty_user)


@pytest.fixture
def course_factory():
    return CourseFactory


@pytest.fixture
def roster(db, course, student_profile):
    return RosterFactory(course=course, student_profile=student_profile)
