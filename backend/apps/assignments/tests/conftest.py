import pytest
from django.urls import reverse
from apps.assignments.tests.factories import (
    AssignmentFactory,
    TestCaseFactory,
    RubricCriteriaFactory,
)


@pytest.fixture
def assignment_urls():
    """A helper fixture to provide common assignment URL patterns."""

    class URLRegistry:
        def list(self):
            return reverse("assignments:assignment-list")

        def detail(self, id):
            return reverse("assignments:assignment-detail", kwargs={"id": id})

        def stats(self, id):
            return reverse("assignments:assignment-stats", kwargs={"id": id})

        def clone(self, id):
            return reverse("assignments:assignment-clone", kwargs={"id": id})

        # def rubrics(self, assignment_id):
        #     return reverse(
        #         "assignments:assignment-rubrics",
        #         kwargs={"assignment_id": assignment_id},
        #     )

        # def test_cases(self, assignment_id):
        #     return reverse(
        #         "assignments:assignment-testcases",
        #         kwargs={"assignment_id": assignment_id},
        #     )

        def rubric_detail(self, id):
            return reverse("assignments:rubric-detail", kwargs={"id": id})

        def test_case_detail(self, id):
            return reverse("assignments:testcase-detail", kwargs={"id": id})

    return URLRegistry()


@pytest.fixture
def assignment(db):
    """Returns a basic assignment instance."""
    return AssignmentFactory()


@pytest.fixture
def rubric(db, assignment):
    """Returns a rubric criteria linked to a fresh assignment."""
    return RubricCriteriaFactory(assignment=assignment)


@pytest.fixture
def test_case(db, assignment):
    """Returns a test case linked to a fresh assignment."""
    return TestCaseFactory(assignment=assignment)


@pytest.fixture
def complete_assignment(db):
    """
    Creates an assignment with 3 rubrics and 5 test cases.
    Perfect for testing 'stats' or 'clone' logic.
    """
    assignment = AssignmentFactory()
    RubricCriteriaFactory.create_batch(3, assignment=assignment)
    TestCaseFactory.create_batch(5, assignment=assignment)
    return assignment
