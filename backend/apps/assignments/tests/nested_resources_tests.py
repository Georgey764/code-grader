import pytest

pytestmark = pytest.mark.django_db


class TestNestedResources:
    # def test_list_rubrics_for_assignment(self, faculty_client, assignment_urls, rubric):
    #     """Verify we can fetch rubrics filtered by assignment ID."""
    #     url = assignment_urls.rubrics(rubric.assignment.id)
    #     response = faculty_client.get(url)

    #     assert response.status_code == 200
    #     # Check that the rubric belongs to the correct assignment
    #     assert response.data[0]["id"] == str(rubric.id)

    # def test_list_test_cases_filtering(
    #     self, faculty_client, assignment_urls, assignment
    # ):
    #     """Verify public/private filtering for test cases."""
    #     from apps.assignments.tests.factories import TestCaseFactory

    #     TestCaseFactory(assignment=assignment, is_public=True)
    #     TestCaseFactory(assignment=assignment, is_public=False)

    #     url = assignment_urls.test_cases(assignment.id)

    #     # Filter Public
    #     res_public = faculty_client.get(url, {"is_public": "true"})
    #     assert len(res_public.data) == 1

    #     # Filter Private
    #     res_private = faculty_client.get(url, {"is_public": "false"})
    #     assert len(res_private.data) == 1

    def test_retrieve_individual_rubric(self, faculty_client, assignment_urls, rubric):
        """Test direct access to a rubric via its detail URL."""
        url = assignment_urls.rubric_detail(rubric.id)
        response = faculty_client.get(url)
        print(response.data)
        print(rubric.id)
        print(url)

        assert response.status_code == 200
        assert response.data["id"] == str(rubric.id)

    def test_delete_test_case(self, faculty_client, assignment_urls, test_case):
        """Verify faculty can delete a test case."""
        url = assignment_urls.test_case_detail(test_case.id)
        response = faculty_client.delete(url)
        print(response.data)

        assert response.status_code == 204
