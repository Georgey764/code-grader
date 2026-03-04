import pytest
from rest_framework import status


@pytest.mark.django_db
class TestSubmissions:
    """Tests for the Submission API endpoints."""

    def test_something(self, student_client, assessment_urls, submission):
        assert True
