from django.test import TestCase
from rest_framework.test import APITestCase
from apps.courses.models import Course, Roster
from apps.accounts.models import StudentProfile, FacultyProfile, User
from apps.core.tests import BaseTest
from django.urls import reverse


class CourseTest(BaseTest):
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

        # self.stranger_course = Course.objects.create(
        #     faculty_profile=self.faculty_stranger_profile,
        #     name="Theory of Database Management Systems",
        #     short_name="CSCI 3060",
        #     crn="60126",
        #     is_active=True,
        #     description="Database management system class.",
        # )

        self.url_list = reverse(
            "accounts:course-list",
        )
        self.url_detail = reverse(
            "accounts:course-detail", kwargs={"pk": self.owner_course.pk}
        )

    def test_faculty_owner_can_view_their_list(self):
        """
        Ensure faculties can only see courses that they own
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        response = self.client.get(self.url_list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Principles of Software Engineering")

    def test_faculty_stranger_can_view_others_list(self):
        """
        Ensure faculties can only see courses that they own
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        response = self.client.get(self.url_list)
        self.assertEqual(len(response.data), 0)

    def test_faculty_owner_can_retrieve(self):
        """
        Ensure faculties can get books that they own
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        response = self.client.get(self.url_detail)
        self.assertEqual(
            response.data.get("name", None), "Principles of Software Engineering"
        )

    def test_faculty_stranger_cannot_retrieve(self):
        """
        Ensure faculties can get books that they own
        """
        self.client.force_authenticate(user=self.faculty_owner_user)
        response = self.client.get(self.url_detail_owner)
        print(response.data)
        # self.assertEqual(
        #     response.data, "Principles of Software Engineering"
        # )

    # def test_enrolled_student_can_see_their_course(self):
    #     """
    #     Ensure faculties can get books that they own
    #     """
    #     self.client.force_authenticate(user=self.faculty_owner_user)
    #     response = self.client.get(self.url)
    #     self.assertEqual(len(response.data), 1)
    #     self.assertEqual(response.data[0]["name"], "Principles of Software Engineering")
