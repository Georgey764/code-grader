import pytest
from django.utils import timezone
from datetime import timedelta

pytestmark = pytest.mark.django_db


class TestAssignmentAPI:
    def test_list_assignments(self, faculty_client, assignment_urls, assignment):
        """Verify faculty can list assignments."""
        url = assignment_urls.list()
        response = faculty_client.get(url)
        assert response.status_code == 200
        assert len(response.data) >= 1

    def test_filter_assignments_by_deadline(self, faculty_client, assignment_urls):
        """Test the 'active' and 'past' query parameter filters."""
        from apps.assignments.tests.factories import AssignmentFactory

        # Create one active and one past assignment
        AssignmentFactory(deadline=timezone.now() + timedelta(days=5))
        AssignmentFactory(deadline=timezone.now() - timedelta(days=5))

        url = assignment_urls.list()

        # Test Active
        active_res = faculty_client.get(url, {"filter": "active"})

        assert all(
            timezone.datetime.fromisoformat(a["deadline"].replace("Z", "+00:00"))
            > timezone.now()
            for a in active_res.data
        )

        # Test Past
        past_res = faculty_client.get(url, {"filter": "past"})
        assert all(
            timezone.datetime.fromisoformat(a["deadline"].replace("Z", "+00:00"))
            < timezone.now()
            for a in past_res.data
        )

    def test_assignment_stats_action(
        self, faculty_client, assignment_urls, complete_assignment
    ):
        """Verify the custom @action 'stats' returns correct counts."""
        url = assignment_urls.stats(complete_assignment.id)
        response = faculty_client.get(url)

        assert response.status_code == 200
        assert response.data["total_rubric_criteria"] == 3
        assert response.data["total_test_cases"] == 5

    def test_clone_assignment_missing_data(
        self, faculty_client, assignment_urls, assignment
    ):
        """Cloning should fail if new_course_id is not provided."""
        url = assignment_urls.clone(assignment.id)
        response = faculty_client.get(
            url
        )  # Should be POST based on your view, but let's check validation

        # If your view expects POST
        response = faculty_client.post(url, data={})
        assert response.status_code == 400
        assert "new_course_id" in response.data["error"]

    def test_student_permissions(self, student_client, assignment_urls, assignment):
        """
        Ensure students can view assignments but perhaps not clone them.
        (Adjust based on your actual permission classes).
        """
        detail_url = assignment_urls.detail(assignment.id)
        response = student_client.get(detail_url)
        assert response.status_code == 200

        clone_url = assignment_urls.clone(assignment.id)
        # Assuming you'll add IsFaculty permissions later
        # response = student_client.post(clone_url, data={"new_course_id": 1})
        # assert response.status_code == 403
