from django.urls import reverse
from rest_framework import status
from apps.courses.models import Course, Roster
from apps.accounts.models import FacultyProfile
from apps.core.tests.tests import BaseTest

class CourseCreationTests(BaseTest):
    # -- Course Creation Success Tests --
    def test_create_course_success(self):
        """Test creating a course successfully"""
        self.client.force_authenticate(user=self.faculty_owner_user)
        url = reverse("courses:course-list")
        data = {
            "crn":"24680",
            "short_name":"CS 101",
            "name":"Intro to Programming"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Course.objects.filter(crn="24680").exists())

    def test_create_course_duplicate_crn(self):
        """Test creating a course with a duplicate CRN"""
        self.client.force_authenticate(user=self.faculty_owner_user)
        url = reverse("courses:course-list")
        data = {
            "crn":"12345",
            "short_name":"CS 101",
            "name":"Intro to Programming"
        }

        # Second creation with same CRN should fail
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_course_invalid_crn(self):
        """Test creating a course with an invalid CRN"""
        self.client.force_authenticate(user=self.faculty_owner_user)
        url = reverse("courses:course-list")
        data = {
            "crn":"0",  # Invalid CRN
            "short_name":"CS 101",
            "name":"Intro to Programming"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Course.objects.filter(crn="0").exists())

    def test_create_course_missing_fields(self):
        """Test creating a course with missing required fields"""
        self.client.force_authenticate(user=self.faculty_owner_user)
        url = reverse("courses:course-list")
        data = {
            "crn": "24680"
            # Missing short_name and name
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Course.objects.filter(crn="67890").exists())

    def test_student_cannot_create_course(self):
        """Test that a student cannot create a course"""
        self.client.force_authenticate(user=self.student_enrolled_user)
        url = reverse("courses:course-list")
        data = {
            "crn": "24680",
            "short_name": "CS 102",
            "name": "Data Structures"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Course.objects.filter(crn="54321").exists())

    def test_anonymous_cannot_create_course(self):
        """Test that an anonymous user cannot create a course"""
        self.client.force_authenticate(user=None)
        url = reverse("courses:course-list")
        data = {
            "crn": "24680",
            "short_name": "CS 102",
            "name": "Data Structures"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(Course.objects.filter(crn="98765").exists())

class CourseRetrievalTests(BaseTest):
    def test_faculty_can_retrieve_owned_course(self):
        """Test that a faculty member can retrieve a course"""
        self.client.force_authenticate(user=self.faculty_owner_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["crn"], 12345)
        self.assertEqual(response.data["faculty_profile"]["id"], str(self.faculty_owner_profile.id))

    def test_faculty_cannot_retrieve_unowned_course(self):
        """Test that a faculty member cannot retrieve a course they do not own"""
        self.client.force_authenticate(user=self.faculty_stranger_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        response = self.client.get(url)

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )

    def test_enrolled_student_can_retrieve_course(self):
        """Test that a student can retrieve a course"""
        self.client.force_authenticate(user=self.student_enrolled_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unenrolled_student_cannot_retrieve_course(self):
        """Test that an unenrolled student cannot retrieve a course"""
        self.client.force_authenticate(user=self.student_unenrolled_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        response = self.client.get(url)

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )

    def test_anonymous_cannot_retrieve_course(self):
        """Test that an anonymous user cannot retrieve a course"""
        self.client.force_authenticate(user=None)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        response = self.client.get(url)

        self.assertIn(
            response.status_code, 
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_404_NOT_FOUND],
        )

    def test_retrieve_course_not_exist(self):
        """Test retrieving a course that does not exist"""
        self.client.force_authenticate(user=self.faculty_owner_user)

        url = reverse("courses:course-detail", args=["c89106a9-a81e-4065-a49e-ce362be2dff7"])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class CourseUpdateTests(BaseTest):
    def test_faculty_can_update_owned_course(self):
        """Test that a faculty member can update a course they own"""
        self.client.force_authenticate(user=self.faculty_owner_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        data = {
            "name": "Advanced Programming",
            "short_name": "CS 201",
            "crn": "54321"
        }
        response = self.client.put(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.programming_course.refresh_from_db()
        self.assertEqual(self.programming_course.name, "Advanced Programming")
        self.assertEqual(self.programming_course.short_name, "CS 201")
        self.assertEqual(self.programming_course.crn, 54321)

    def test_faculty_cannot_update_unowned_course(self):
        """Test that a faculty member cannot update a course they do not own"""
        self.client.force_authenticate(user=self.faculty_stranger_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        data = {
            "name": "Hacking 101",
            "short_name": "CS 301",
            "crn": "99999"
        }
        response = self.client.put(url, data)

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )
        self.programming_course.refresh_from_db()
        self.assertEqual(self.programming_course.name, "Intro to Programming")
        self.assertEqual(self.programming_course.short_name, "CS 101")
        self.assertEqual(self.programming_course.crn, 12345)

    def test_student_cannot_update_course(self):
        """Test that a student cannot update a course"""
        self.client.force_authenticate(user=self.student_enrolled_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        data = {
            "name": "Student Hacking 101",
            "short_name": "CS 401",
            "crn": "88888"
        }
        response = self.client.put(url, data)

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )
        self.programming_course.refresh_from_db()
        self.assertEqual(self.programming_course.name, "Intro to Programming")
        self.assertEqual(self.programming_course.short_name, "CS 101")
        self.assertEqual(self.programming_course.crn, 12345)

    def test_anonymous_cannot_update_course(self):
        """Test that an anonymous user cannot update a course"""
        self.client.force_authenticate(user=None)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        data = {
            "name": "Anonymous Hacking 101",
            "short_name": "CS 501",
            "crn": "77777"
        }
        response = self.client.put(url, data)

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_404_NOT_FOUND],
        )
        self.programming_course.refresh_from_db()
        self.assertEqual(self.programming_course.name, "Intro to Programming")
        self.assertEqual(self.programming_course.short_name, "CS 101")
        self.assertEqual(self.programming_course.crn, 12345)

    def test_faculty_cannot_update_course_duplicate_crn(self):
        """Test that a course cannot be updated to have a duplicate CRN"""
        self.client.force_authenticate(user=self.faculty_owner_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        data = {
            "name": "Advanced Programming",
            "short_name": "CS 201",
            "crn": "12345"  # Assuming this CRN already exists
        }
        response = self.client.put(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.programming_course.refresh_from_db()
        self.assertEqual(self.programming_course.name, "Intro to Programming")
        self.assertEqual(self.programming_course.short_name, "CS 101")
        self.assertEqual(self.programming_course.crn, 12345)

    def test_faculty_cannot_update_course_invalid_data(self):
        """Test that a course cannot be updated with invalid data"""
        self.client.force_authenticate(user=self.faculty_owner_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        data = {
            "name": "",  # Invalid name
            "short_name": "CS 301",
            "crn": "0"  # Invalid CRN
        }
        response = self.client.put(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.programming_course.refresh_from_db()
        self.assertEqual(self.programming_course.name, "Intro to Programming")
        self.assertEqual(self.programming_course.short_name, "CS 101")
        self.assertEqual(self.programming_course.crn, 12345)

class CourseDeleteTests(BaseTest):
    def test_faculty_can_delete_owned_course(self):
        """Test that a faculty member can delete a course they own"""
        self.client.force_authenticate(user=self.faculty_owner_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Course.objects.filter(id=self.programming_course.id).exists())

    def test_faculty_cannot_delete_unowned_course(self):
        """Test that a faculty member cannot delete a course they do not own"""
        self.client.force_authenticate(user=self.faculty_stranger_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        response = self.client.delete(url)

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )
        self.assertTrue(Course.objects.filter(id=self.programming_course.id).exists())

    def test_student_cannot_delete_course(self):
        """Test that a student cannot delete a course"""
        self.client.force_authenticate(user=self.student_enrolled_user)

        url = reverse("courses:course-detail", args=[self.programming_course.id])
        response = self.client.delete(url)

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )
        self.assertTrue(Course.objects.filter(id=self.programming_course.id).exists())

    def test_anonymous_cannot_delete_course(self):
        """Test that an anonymous user cannot delete a course"""
        url = reverse("courses:course-detail", args=[self.programming_course.id])
        response = self.client.delete(url)

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )
        self.assertTrue(Course.objects.filter(id=self.programming_course.id).exists())

class RosterTests(BaseTest):
    def test_student_can_enroll_to_course(self):
        """Test that a student can be added to a course"""
        self.client.force_authenticate(user=self.student_unenrolled_user)

        url = reverse("courses:roster-create")
        data = {
            "course_id": str(self.programming_course.id)
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_student_cannot_enroll_to_course_they_are_already_enrolled_in(self):
        """Test that a student cannot be added to a course they are already enrolled in"""
        self.client.force_authenticate(user=self.student_enrolled_user)

        url = reverse("courses:roster-create")
        data = {
            "course_id": str(self.programming_course.id)
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_cannot_enroll_to_nonexistent_course(self):
        """Test that a student cannot be added to a nonexistent course"""
        self.client.force_authenticate(user=self.student_unenrolled_user)

        url = reverse("courses:roster-create")
        data = {
            "course_id": "c89106a9-a81e-4065-a49e-ce362be2dff7"
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_faculty_cannot_enroll_to_course(self):
        """Test that a faculty member cannot be added to a course"""
        self.client.force_authenticate(user=self.faculty_owner_user)

        url = reverse("courses:roster-create")
        data = {
            "course_id": str(self.programming_course.id)
        }
        response = self.client.post(url, data)

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )

    def test_anonymous_cannot_enroll_to_course(self):
        """Test that an anonymous user cannot be added to a course"""
        url = reverse("courses:roster-create")
        data = {
            "course_id": str(self.programming_course.id)
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_can_unenroll_from_course(self):
        """Test that a student can be removed from a course"""
        self.client.force_authenticate(user=self.student_enrolled_user)

        url = reverse("courses:roster-destroy", kwargs={"pk": self.programming_course.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_student_cannot_unenroll_from_course_they_are_not_enrolled_in(self):
        """Test that a student cannot be removed from a course they are not enrolled in"""
        self.client.force_authenticate(user=self.student_unenrolled_user)

        url = reverse("courses:roster-destroy", kwargs={"pk": self.programming_course.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_faculty_cannot_unenroll_from_course(self):
        """Test that a faculty member cannot be removed from a course"""
        self.client.force_authenticate(user=self.faculty_owner_user)

        url = reverse("courses:roster-destroy", kwargs={"pk": self.programming_course.id})
        response = self.client.post(url)

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )

    def test_anonymous_cannot_unenroll_from_course(self):
        """Test that an anonymous user cannot be removed from a course"""
        url = reverse("courses:roster-destroy", kwargs={"pk": self.programming_course.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class EdgeCaseTests(BaseTest):
    def test_student_cannot_enroll_to_course_with_invalid_id(self):
        self.client.force_authenticate(user=self.student_unenrolled_user)

        url = reverse("courses:roster-create")
        data = {
            "course_id": ["invalid-id"]
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_cannot_enroll_from_course_with_unexpected_fields(self):
        """Test that a student cannot unenroll from a course with unexpected fields"""
        self.client.force_authenticate(user=self.student_unenrolled_user)

        url = reverse("courses:roster-create")
        data = {
            "course_id": str(self.programming_course.id),
            "unexpected_field": "unexpected_value"
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
