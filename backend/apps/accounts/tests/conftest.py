import pytest
from django.urls import reverse
from apps.accounts.tests.factories import (
    UserFactory,
    FacultyProfileFactory,
    StudentProfileFactory,
)


@pytest.fixture
def list_url():
    return reverse("accounts:user-register")


@pytest.fixture
def student_detail_url(student_user, student_profile):
    return reverse("accounts:student-detail", kwargs={"cwid": student_user.cwid})


@pytest.fixture
def faculty_detail_url(faculty_user, faculty_profile):
    return reverse("accounts:faculty-detail", kwargs={"cwid": faculty_user.cwid})


@pytest.fixture
def other_student_user(db):
    return UserFactory(student=True)


@pytest.fixture
def other_student_profile(db, other_student_user):
    return StudentProfileFactory(user=other_student_user)


@pytest.fixture
def other_student_client(api_client, other_student_user):
    api_client.force_authenticate(user=other_student_user)
    return api_client


@pytest.fixture
def other_faculty_user(db):
    return UserFactory(faculty=True)


@pytest.fixture
def other_faculty_profile(db, other_faculty_user):
    return FacultyProfileFactory(user=other_faculty_user)


@pytest.fixture
def other_faculty_client(api_client, other_faculty_user):
    api_client.force_authenticate(user=other_faculty_user)
    return api_client
