import pytest
from rest_framework import status
from apps.assignments.models import TestCase


@pytest.mark.django_db
class TestTestCaseViewSet:
    def test_retrieve_test_case(self, faculty_client, assignment_urls, test_case):
        url = assignment_urls.test_case_detail(test_case.id)
        response = faculty_client.get(url)
        print(response.data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == str(test_case.id)

        # Ensure the FK to assignment is present
        assert str(response.data["assignment"]) == str(test_case.assignment.id)

    def test_delete_test_case(self, faculty_client, assignment_urls, test_case):
        url = assignment_urls.test_case_detail(test_case.id)
        response = faculty_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not TestCase.objects.filter(id=test_case.id).exists()


@pytest.mark.django_db
class TestRubricViewSet:
    def test_update_rubric(self, faculty_client, assignment_urls, rubric):
        url = assignment_urls.rubric_detail(rubric.id)
        payload = {
            "name": "Updated Criteria Name",
            "max_points": 50.0,
            "assignment": rubric.assignment.id,
        }

        response = faculty_client.put(url, data=payload, format="json")

        assert response.status_code == status.HTTP_200_OK
        rubric.refresh_from_db()
        assert rubric.name == "Updated Criteria Name"
        assert rubric.max_points == 50.0
