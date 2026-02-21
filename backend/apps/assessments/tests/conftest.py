import pytest
from rest_framework.reverse import reverse
from apps.assessments.tests.factories import (
    SubmissionFactory,
    RubricResultFactory,
    TestResultFactory,
)
from apps.assignments.tests.factories import AssignmentFactory, TestCaseFactory
from apps.courses.tests.factories import RosterFactory, CourseFactory
import boto3

LOCALSTACK_ENDPOINT = "http://localstack:4566"


@pytest.fixture
def s3_client():
    return boto3.client(
        "s3",
        endpoint_url=LOCALSTACK_ENDPOINT,
        region_name="us-east-1",
    )


@pytest.fixture
def logs_client():
    return boto3.client(
        "logs",
        endpoint_url=LOCALSTACK_ENDPOINT,
        region_name="us-east-1",
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

        def submission_run_tests(self, submission_id):
            return reverse("submission-run-tests", args=[submission_id])

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
def course(db):
    return CourseFactory()


@pytest.fixture
def roster(
    db, course, student_user, student_client, student_profile, test_case_add, submission
):
    return RosterFactory(course=course, student_profile=student_profile)


@pytest.fixture()
def assignment(db, course):
    return AssignmentFactory(course=course)


@pytest.fixture
def submission(db, assignment, test_case_add):
    """Creates a base submission with all necessary parent relations (Roster, Assignment)."""
    return SubmissionFactory(assignment=assignment)


@pytest.fixture
def test_case_add(db, assignment):
    return TestCaseFactory(
        input_text="1\n1", expected_output="2", assignment=assignment
    )


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
def test_result(db, submission):
    """Creates a specific passing test result."""
    return TestResultFactory(submission=submission)


@pytest.fixture
def full_graded_submission(db, submission):
    """
    A 'composite' fixture: Creates a submission that has both
    automated test results and a manual rubric result.
    """
    TestResultFactory.create_batch(3, submission=submission)
    RubricResultFactory(submission=submission)
    return submission


# @pytest.fixture
# def course(db):
#     return CourseFactory()


# @pytest.fixture
# def roster(db, course):
#     return RosterFactory(course=course)


# @pytest.fixture
# def assignment(db, course):
#     return AssignmentFactory(course=course)
