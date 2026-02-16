import pytest
from rest_framework.reverse import reverse
from apps.assessments.tests.factories import (
    SubmissionFactory,
    RubricResultFactory,
    TestResultFactory,
)


@pytest.fixture
def assessment_urls():
    """Central registry for all API URLs."""

    class URLRegistry:
        # Submissions
        @property
        def submissions_list(self):
            return reverse("submission-list")

        def submission_detail(self, submission_id):
            return reverse("submission-detail", args=[submission_id])

        # Rubric Results
        @property
        def rubric_results_list(self):
            return reverse("rubricresult-list")

        def rubric_result_detail(self, rubric_result_id):
            return reverse("rubricresult-detail", args=[rubric_result_id])

        # Test Results
        @property
        def test_results_list(self):
            return reverse("testresult-list")

        def test_result_detail(self, test_result_id):
            return reverse("testresult-detail", args=[test_result_id])

    return URLRegistry()


@pytest.fixture
def submission(db):
    """Creates a base submission with all necessary parent relations (Roster, Assignment)."""
    return SubmissionFactory()


@pytest.fixture
def submission_with_group(db):
    """Creates a submission specifically linked to a group."""
    from .factories import GroupFactory  # Assuming this exists

    return SubmissionFactory(group=GroupFactory())


@pytest.fixture
def rubric_result(db, submission):
    """Creates a rubric score for the provided submission."""
    return RubricResultFactory(submission=submission)


@pytest.fixture
def passing_test_result(db, submission):
    """Creates a specific passing test result."""
    return TestResultFactory(submission=submission, status="PASS", points_earned=10.0)


@pytest.fixture
def failing_test_result(db, submission):
    """Creates a specific failing test result with an error message."""
    return TestResultFactory(
        submission=submission, status="FAIL", error_message="AssertionError: 1 != 2"
    )


@pytest.fixture
def full_graded_submission(db, submission):
    """
    A 'composite' fixture: Creates a submission that has both
    automated test results and a manual rubric result.
    """
    TestResultFactory.create_batch(3, submission=submission, status="PASS")
    RubricResultFactory(submission=submission, points_awarded=100.0)
    return submission
