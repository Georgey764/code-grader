from django.urls import reverse
from rest_framework import status
from apps.accounts.models import User, Roles, StudentProfile, FacultyProfile
from apps.core.tests.tests import BaseTest
from rest_framework.test import APITestCase


class RegistrationTests(APITestCase):
    def test_register_student_success(self):
        url = reverse("accounts:user-register")
        data = {
            "email": "newstudent@ulm.edu",
            "first_name": "New",
            "last_name": "Student",
            "role": Roles.STUDENT,
            "cwid": "12345678",
            "password": "securepassword123",
            "password_confirm": "securepassword123",
            "major": "Computer Science",
            "classification": "Freshman",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            StudentProfile.objects.filter(user__email=data["email"]).exists()
        )

    def test_register_faculty_missing_fields(self):
        """Faculties must provide title and phone per your serializer validation."""
        url = reverse("accounts:user-register")
        data = {
            "email": "newfaculty@ulm.edu",
            "role": Roles.FACULTY,
            "cwid": "87654321",
            "password": "securepassword123",
            "password_confirm": "securepassword123",
            # title and phone are missing
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AccountDetailPermissionsTests(BaseTest):
    def test_student_cannot_access_other_student_profile(self):
        """Test Is_Profile_Owner permission."""
        # Authenticate as student A
        self.client.force_authenticate(user=self.student_enrolled_user)

        # Try to access student B's profile
        url = reverse(
            "accounts:student-detail",
            kwargs={"cwid": self.student_unenrolled_user.cwid},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_faculty_can_access_own_profile(self):
        self.client.force_authenticate(user=self.faculty_owner_user)
        url = reverse(
            "accounts:faculty-detail", kwargs={"cwid": self.faculty_owner_user.cwid}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["email"], self.faculty_owner_user.email)

    def test_student_cannot_access_faculty_profile(self):
        """Test Is_Faculty permission on FacultyDetailView."""
        self.client.force_authenticate(user=self.student_enrolled_user)
        url = reverse(
            "accounts:faculty-detail", kwargs={"cwid": self.faculty_owner_user.cwid}
        )
        response = self.client.get(url)

        # Should fail because student is not a Faculty role
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_student_profile_and_user_data(self):
        """Tests the nested update logic in StudentSerializer."""
        self.client.force_authenticate(user=self.student_enrolled_user)
        url = reverse(
            "accounts:student-detail", kwargs={"cwid": self.student_enrolled_user.cwid}
        )

        data = {"major": "Data Science", "user": {"first_name": "UpdatedName"}}
        response = self.client.patch(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student_enrolled_user.refresh_from_db()
        self.student_enrolled_profile.refresh_from_db()

        self.assertEqual(self.student_enrolled_user.first_name, "UpdatedName")
        self.assertEqual(self.student_enrolled_profile.major, "Data Science")


class AccountUpdatePermissionsTests(BaseTest):
    # --- STUDENT UPDATES ---

    def test_student_can_patch_own_profile(self):
        """PATCH: Should succeed when student updates their own major."""
        self.client.force_authenticate(user=self.student_enrolled_user)
        url = reverse(
            "accounts:student-detail", kwargs={"cwid": self.student_enrolled_user.cwid}
        )

        payload = {"major": "Cybersecurity"}
        response = self.client.patch(url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student_enrolled_profile.refresh_from_db()
        self.assertEqual(self.student_enrolled_profile.major, "Cybersecurity")

    def test_student_cannot_put_other_student_profile(self):
        """PUT: Should fail when Student A tries to overwrite Student B's data."""
        self.client.force_authenticate(user=self.student_enrolled_user)
        # Target the UNENROLLED student's CWID
        url = reverse(
            "accounts:student-detail",
            kwargs={"cwid": self.student_unenrolled_user.cwid},
        )

        payload = {
            "major": "Hacking",
            "classification": "Senior",
            "user": {"first_name": "I am a hacker"},
        }
        response = self.client.put(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --- FACULTY UPDATES ---

    def test_faculty_can_patch_own_profile(self):
        """PATCH: Faculty updating their own phone number."""
        self.client.force_authenticate(user=self.faculty_owner_user)
        url = reverse(
            "accounts:faculty-detail", kwargs={"cwid": self.faculty_owner_user.cwid}
        )

        payload = {"phone": "+13185551234"}
        response = self.client.patch(url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.faculty_owner_profile.refresh_from_db()
        # Note: phonenumber_field might format this, but the update should succeed
        self.assertTrue(response.data["phone"].endswith("1234"))

    def test_faculty_cannot_patch_student_profile(self):
        """Cross-Role: Faculty should not be able to edit a Student profile."""
        self.client.force_authenticate(user=self.faculty_owner_user)
        url = reverse(
            "accounts:student-detail", kwargs={"cwid": self.student_enrolled_user.cwid}
        )

        payload = {"major": "Biology"}
        response = self.client.patch(url, payload)

        # Fails because Faculty does not pass 'Is_Student' permission on StudentDetailView
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --- UNAUTHENTICATED ---

    def test_unauthenticated_user_cannot_update(self):
        """Safety: Ensure anonymous users are blocked entirely."""
        # No self.client.force_authenticate()
        url = reverse(
            "accounts:student-detail", kwargs={"cwid": self.student_enrolled_user.cwid}
        )

        response = self.client.patch(url, {"major": "Physics"})
        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED],
        )
