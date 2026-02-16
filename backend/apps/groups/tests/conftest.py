import pytest
from .factories import GroupFactory, GroupsMembershipFactory
from django.urls import reverse


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
