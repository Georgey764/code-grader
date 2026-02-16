import pytest
from rest_framework import status


@pytest.mark.django_db
class TestSubmissions:
    """Tests for the Submission API endpoints."""

    def test_student_can_list_submissions(
        self, student_client, assessment_urls, submission
    ):
        """Verify an authenticated student can see their submissions."""
        # Note: In a real app, you'd filter the queryset in the ViewSet
        # to ensure students only see their OWN submissions.
        url = assessment_urls.submissions_list
        response = student_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_student_can_retrieve_submission_detail(
        self, student_client, assessment_urls, full_graded_submission
    ):
        """Verify nested results (tests and rubrics) are included in the detail view."""
        url = assessment_urls.submission_detail(full_graded_submission.id)
        response = student_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Check nested serializers logic
        assert "test_results" in response.data
        assert "rubric_results" in response.data
        assert len(response.data["test_results"]) == 3

    def test_run_tests_action(self, faculty_client, assessment_urls, submission):
        """Tests the custom @action to trigger the autograder."""
        url = f"{assessment_urls.submission_detail(submission.id)}run_tests/"
        response = faculty_client.post(url)

        assert response.status_code == status.HTTP_202_ACCEPTED
        assert response.data["status"] == "Tests triggered"


@pytest.mark.django_db
class TestRubricResults:
    """Tests for manual grading by faculty."""

    def test_faculty_can_create_rubric_result(
        self, faculty_client, assessment_urls, submission
    ):
        """Verify faculty can grade a submission via a rubric."""
        from .factories import RubricCriteriaFactory  # Assuming this exists

        criteria = RubricCriteriaFactory()

        url = assessment_urls.rubric_results_list
        data = {
            "submission": submission.id,
            "rubric_criteria": criteria.id,
            "points_awarded": 8.5,
            "optional_feedback": "Excellent logic flow.",
        }

        response = faculty_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert float(response.data["points_awarded"]) == 8.5

    # def test_student_cannot_create_rubric_result(
    #     self, student_client, assessment_urls, submission
    # ):
    #     """Students should not be able to grade themselves."""
    #     url = assessment_urls.rubric_results_list
    #     data = {"submission": submission.id, "points_awarded": 100.0}

    #     response = student_client.post(url, data)
    #     print(response.data)
    #     # Assuming you have IsFaculty or standard Django permissions
    #     assert response.status_code in [
    #         status.HTTP_403_FORBIDDEN,
    #         status.HTTP_401_UNAUTHORIZED,
    #     ]


@pytest.mark.django_db
class TestTestResults:
    """Tests for automated test results."""

    def test_test_results_are_read_only(
        self, faculty_client, assessment_urls, passing_test_result
    ):
        """Verify the ReadOnlyModelViewSet prevents manual modification."""
        url = assessment_urls.test_result_detail(passing_test_result.id)
        data = {"status": "FAIL"}

        # Attempt to change a PASS to a FAIL
        response = faculty_client.put(url, data)
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_filter_test_results_by_submission(
        self, faculty_client, assessment_urls, submission, passing_test_result
    ):
        """Verify query parameter filtering works (if implemented in ViewSet)."""
        url = f"{assessment_urls.test_results_list}?submission_id={submission.id}"
        response = faculty_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Ensure only tests for this submission are returned
        for result in response.data:
            assert str(result["submission"]) == str(submission.id)
