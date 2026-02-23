from rest_framework import status
from apps.courses.models import Course, Roster
from apps.core.tests.tests import BaseTest
from django.urls import reverse
from rest_framework.generics import get_object_or_404
import uuid


class CoursesBaseTest(BaseTest):
    def setUp(self):
        super().setUp()

        self.owner_course = Course.objects.create(
            faculty_profile=self.faculty_owner_profile,
            name="Principles of Software Engineering",
            short_name="CSCI 4060",
            crn="60512",
            is_active=True,
            description="Software engineering capstone class.",
        )

        self.roster = Roster.objects.create(
            student_profile=self.student_enrolled_profile, course=self.owner_course
        )


class CourseTest(CoursesBaseTest):
    def setUp(self):
        super().setUp()

        self.url_list = reverse(
            "courses:course-list",
        )
        self.url_detail = reverse(
            "courses:course-detail", kwargs={"pk": self.owner_course.pk}
        )

    def test_faculty_owner_can_view_their_list(self):
        """
        Ensure faculties can only see courses that they own
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        response = self.client.get(self.url_list)
        self.assertEqual(len(response.data), 2)

    def test_faculty_stranger_cannot_view_others_list(self):
        """
        Ensure faculty_stranger_cannot_view_others_list
        """
        self.client.force_authenticate(user=self.faculty_stranger_user)
        response = self.client.get(self.url_list)
        self.assertEqual(len(response.data), 0)

    def test_faculty_owner_can_retrieve(self):
        """
        Ensure faculty_owner_can_retrieve_course
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        response = self.client.get(self.url_detail)
        self.assertEqual(
            response.data.get("name"), "Principles of Software Engineering"
        )

    def test_faculty_stranger_cannot_retrieve(self):
        """
        Ensure faculty stranger cannot see the course that they dont own
        """
        self.client.force_authenticate(user=self.faculty_stranger_user)
        response = self.client.get(self.url_detail)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_faculty_owner_can_delete(self):
        """
        Ensure faculty_owner_can_delete_course
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        response = self.client.delete(self.url_detail)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        course_exists = Course.objects.filter(pk=self.owner_course.pk).exists()
        self.assertFalse(course_exists)

    def test_faculty_stranger_cannot_delete(self):
        """
        Ensure faculty_stranger_cannot_delete_course
        """
        self.client.force_authenticate(user=self.faculty_stranger_user)
        response = self.client.delete(self.url_detail)
        self.assertIn(
            response.status_code,
            [
                status.HTTP_404_NOT_FOUND,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_401_UNAUTHORIZED,
            ],
        )
        course_exists = Course.objects.filter(pk=self.owner_course.pk).exists()
        self.assertTrue(course_exists)

    def test_faculty_can_create(self):
        """
        Ensure faculty_can_create_course
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        data = {
            "name": "Intro to Programming",
            "short_name": "CSCI 2003",
            "crn": "60128",
            "is_active": True,
            "description": "Programming intro class.",
        }
        response = self.client.post(self.url_list, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get("crn"), 60128)

    def test_student_can_list(self):
        self.client.force_authenticate(user=self.student_enrolled_user)
        response = self.client.get(self.url_list)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
            ],
        )
        self.assertIn(
            response.data[0].get("name"),
            ["Intro to Programming", "Principles of Software Engineering"],
        )

    def test_student_enrolled_can_retrieve(self):
        self.client.force_authenticate(user=self.student_enrolled_user)
        response = self.client.get(self.url_detail)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data.get("name"),
            "Principles of Software Engineering",
        )

    def test_student_cannot_delete(self):
        self.client.force_authenticate(user=self.student_enrolled_user)
        response = self.client.delete(self.url_detail)
        self.assertIn(
            response.status_code,
            [
                status.HTTP_404_NOT_FOUND,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_401_UNAUTHORIZED,
            ],
        )

    def test_faculty_owner_can_put_course(self):
        """
        Ensure the faculty owner can perform a full update (PUT) on their course.
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        payload = {
            "faculty_profile": self.faculty_owner_profile.pk,
            "name": "Advanced Software Engineering",
            "short_name": "CSCI 4061",
            "crn": "77777",
            "is_active": False,
            "description": "Updated description",
        }
        response = self.client.put(self.url_detail, data=payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.owner_course.refresh_from_db()
        self.assertEqual(self.owner_course.name, "Advanced Software Engineering")
        self.assertEqual(self.owner_course.crn, 77777)

    def test_faculty_owner_can_patch_course(self):
        """
        Ensure the faculty owner can perform a partial update (PATCH) on their course.
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        payload = {"name": "New Course Name"}
        response = self.client.patch(self.url_detail, data=payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.owner_course.refresh_from_db()
        self.assertEqual(self.owner_course.name, "New Course Name")
        # Ensure other fields remained the same
        self.assertEqual(self.owner_course.crn, 60512)

    def test_faculty_stranger_cannot_patch_others_course(self):
        """
        Ensure a faculty member cannot update a course they do not own.
        """
        self.client.force_authenticate(user=self.faculty_stranger_user)
        payload = {"name": "I am a hacker"}
        response = self.client.patch(self.url_detail, data=payload)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_404_NOT_FOUND,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_401_UNAUTHORIZED,
            ],
        )

        self.owner_course.refresh_from_db()
        self.assertNotEqual(self.owner_course.name, "I am a hacker")

    def test_student_cannot_patch_course(self):
        """
        Ensure students (enrolled or not) do not have update permissions.
        """
        self.client.force_authenticate(user=self.student_enrolled_user)
        payload = {"name": "Easy A Grade Course"}
        response = self.client.patch(self.url_detail, data=payload)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class RosterTest(CoursesBaseTest):
    def setUp(self):
        super().setUp()
        self.url_destroy = reverse(
            "courses:roster-destroy", kwargs={"pk": self.roster.pk}
        )
        self.url_create = reverse("courses:roster-create")

    def test_student_enrolled_can_delete(self):
        self.client.force_authenticate(user=self.student_enrolled_user)
        response = self.client.delete(self.url_destroy)
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        roster_exists = Roster.objects.filter(
            student_profile=self.student_unenrolled_profile,
            course=self.owner_course,
        ).exists()
        self.assertFalse(roster_exists)

    def test_student_unenrolled_cannot_delete(self):
        self.client.force_authenticate(user=self.student_unenrolled_user)
        response = self.client.delete(self.url_destroy)
        self.assertIn(
            response.status_code,
            [
                status.HTTP_404_NOT_FOUND,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_401_UNAUTHORIZED,
            ],
        )
        roster_exists = Roster.objects.filter(
            student_profile=self.student_enrolled_profile,
            course=self.owner_course,
        ).exists()
        self.assertTrue(roster_exists)

    def test_faculty_owner_cannot_delete(self):
        self.client.force_authenticate(user=self.faculty_owner_user)
        response = self.client.delete(self.url_destroy)
        self.assertIn(
            response.status_code,
            [
                status.HTTP_404_NOT_FOUND,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_401_UNAUTHORIZED,
            ],
        )
        roster_exists = Roster.objects.filter(
            student_profile=self.student_enrolled_profile,
            course=self.owner_course,
        ).exists()
        self.assertTrue(roster_exists)

    def test_student_can_create(self):
        self.client.force_authenticate(user=self.student_unenrolled_user)
        payload = {
            "course_id": self.owner_course.pk,
        }
        response = self.client.post(self.url_create, data=payload, format="json")
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            uuid.UUID(response.data.get("student_profile").get("id")),
            self.student_unenrolled_profile.id,
        )

    def test_student_cannot_create_duplicate(self):
        self.client.force_authenticate(user=self.student_enrolled_user)
        response = self.client.post(self.url_create)
        self.assertIn(
            response.status_code,
            [
                status.HTTP_404_NOT_FOUND,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_400_BAD_REQUEST,
            ],
        )

    def test_faculty_owner_cannot_create(self):
        self.client.force_authenticate(user=self.faculty_owner_user)
        response = self.client.post(self.url_create)
        self.assertIn(
            response.status_code,
            [
                status.HTTP_204_NO_CONTENT,
                status.HTTP_404_NOT_FOUND,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_401_UNAUTHORIZED,
            ],
        )
