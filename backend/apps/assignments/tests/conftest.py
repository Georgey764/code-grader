import pytest
from django.urls import reverse
from apps.assignments.tests.factories import (
    AssignmentFactory,
    TestCaseFactory,
    RubricCriteriaFactory,
    GroupsMembershipFactory,
    GroupFactory,
)


@pytest.fixture
def assignment_urls():
    """A helper fixture to provide common assignment URL patterns."""

    class URLRegistry:
        # Assignments
        def list(self):
            return reverse("assignments:assignment-list")

        def detail(self, pk):
            return reverse("assignments:assignment-detail", kwargs={"id": pk})

        def stats(self, pk):
            return reverse("assignments:assignment-stats", kwargs={"id": pk})

        def clone(self, pk):
            return reverse("assignments:assignment-clone", kwargs={"id": pk})

        # Rubrics
        def rubric_detail(self, pk):
            return reverse("assignments:rubric-detail", kwargs={"id": pk})

        # Test Cases
        def test_case_detail(self, pk):
            return reverse("assignments:testcase-detail", kwargs={"pk": pk})

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


@pytest.fixture
def group_urls():
    """Helper fixture to provide common group-related URL patterns."""

    class URLRegistry:
        # ---- GROUP ROUTES ----

        def list(self):
            return reverse("group-list")

        def detail(self, pk):
            return reverse("group-detail", kwargs={"pk": pk})

        # ---- MEMBERSHIP ROUTES ----

        def memberships_list(self):
            return reverse("membership-list")

        def membership_detail(self, pk):
            return reverse("membership-detail", kwargs={"pk": pk})

    return URLRegistry()


@pytest.fixture
def group(db):
    """Returns a single group instance."""
    return GroupFactory()


@pytest.fixture
def group_with_members(db, group):
    """Returns a group with 3 members already assigned."""
    GroupsMembershipFactory.create_batch(3, group=group)
    return group


@pytest.fixture
def membership(db, group):
    """Returns a single membership instance."""
    return GroupsMembershipFactory(group=group)


@pytest.fixture
def group_leader(db, group):
    """Returns a membership instance where the user is a leader."""
    return GroupsMembershipFactory(is_leader=True, group=group)
