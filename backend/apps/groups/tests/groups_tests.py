import pytest
from rest_framework import status
from apps.groups.models import Group, GroupsMembership


@pytest.mark.django_db
class TestGroupViewSet:
    def test_list_groups_with_nested_data(
        self, faculty_client, group_urls, group_with_members
    ):
        """Verify groups list includes current member counts and nested details."""
        url = group_urls.list()
        response = faculty_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Check that the SerializerMethodField/source logic is working
        first_group = response.data[0]
        assert "current_count" in first_group
        assert "memberships" in first_group
        assert len(first_group["memberships"]) == 3

    def test_filter_groups_by_assignment(self, faculty_client, group_urls, group):
        """Verify the ?assignment_id= query parameter (which filters by Assignment)."""
        url = f"{group_urls.list()}?assignment_id={group.assignment.id}"
        response = faculty_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["id"] == str(group.id)

    def test_create_group_validation(self, faculty_client, group_urls):
        """Verify that max_members must be at least 1."""
        from apps.assignments.tests.factories import AssignmentFactory

        assignment = AssignmentFactory()
        url = group_urls.list()

        data = {
            "assignment": assignment.id,
            "name": "Beta Team",
            "max_members": 0,  # This should trigger your serializer validate()
        }

        response = faculty_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "non_field_errors" in response.data


@pytest.mark.django_db
class TestGroupsMembershipViewSet:
    def test_join_group_under_limit(self, student_client, group_urls, group):
        """Verify a user can join a group when it isn't full."""
        from apps.courses.tests.factories import RosterFactory

        roster = RosterFactory()
        url = group_urls.memberships_list()
        print(url)

        data = {"group": group.id, "roster": roster.id, "is_leader": False}

        response = student_client.post(url, data)
        print(response.data)
        assert response.status_code == status.HTTP_201_CREATED
        assert GroupsMembership.objects.filter(group=group, roster=roster).exists()

    def test_join_group_at_limit_fails(self, student_client, group_urls):
        """Verify custom ViewSet logic prevents joining a full group."""
        from apps.assignments.tests.factories import AssignmentFactory
        from apps.courses.tests.factories import RosterFactory

        # Create group with max 1 member
        assignment = AssignmentFactory()
        group = Group.objects.create(
            assignment=assignment, name="Solo Only", max_members=1
        )

        # Fill the only slot
        existing_roster = RosterFactory()
        GroupsMembership.objects.create(group=group, roster=existing_roster)

        # Attempt to join as second member
        new_roster = RosterFactory()
        url = group_urls.memberships_list()
        data = {"group": group.id, "roster": new_roster.id}

        response = student_client.post(url, data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "reached its limit" in response.data["error"]

    def test_unique_membership_constraint(self, student_client, group_urls, membership):
        """Verify a roster entry cannot join the same group twice."""
        url = group_urls.memberships_list()
        data = {"group": membership.group.id, "roster": membership.roster.id}

        response = student_client.post(url, data)
        # Should be caught by the unique_together constraint in the serializer/DB
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_remove_member_from_group(self, faculty_client, group_urls, membership):
        """Verify deleting a membership record works."""
        url = group_urls.membership_detail(membership.id)
        response = faculty_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not GroupsMembership.objects.filter(id=membership.id).exists()
