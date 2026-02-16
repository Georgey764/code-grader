import pytest
from rest_framework.test import APIClient
from apps.accounts.tests.factories import (
    UserFactory,
    FacultyProfileFactory,
    StudentProfileFactory,
)


@pytest.fixture
def api_client():
    """Provides a fresh DRF APIClient for every test."""
    return APIClient()


@pytest.fixture
def student_user(db):
    return UserFactory(student=True)


@pytest.fixture
def student_profile(db, student_user):
    return StudentProfileFactory(user=student_user)


@pytest.fixture
def student_client(api_client, student_user):
    api_client.force_authenticate(user=student_user)
    return api_client


@pytest.fixture
def faculty_user(db):
    return UserFactory(faculty=True)


@pytest.fixture
def faculty_profile(db, faculty_user):
    faculty_prof = FacultyProfileFactory(user=faculty_user)
    return faculty_prof


@pytest.fixture
def faculty_client(api_client, faculty_user):
    api_client.force_authenticate(user=faculty_user)
    return api_client


@pytest.fixture
def failure_status_codes():
    return [400, 401, 403, 404]
