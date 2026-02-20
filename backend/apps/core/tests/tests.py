from django.test import TestCase
from rest_framework.test import APITestCase
from apps.courses.models import Course, Roster
from apps.accounts.models import StudentProfile, FacultyProfile, User, Roles


class BaseTest(APITestCase):
    def setUp(self):
        self.faculty_owner_user = User.objects.create_user(
            email="lonsmith@gmail.com",
            password="lonsmith123",
            first_name="lon",
            last_name="smith",
            role=Roles.FACULTY,
            cwid="30157204",
        )
        self.student_enrolled_user = User.objects.create_user(
            email="georgesamuel764@gmail.com",
            password="lonsmith123",
            first_name="george",
            last_name="khawas",
            role=Roles.STUDENT,
            cwid="30157203",
        )
        self.faculty_owner_profile = FacultyProfile.objects.create(
            user=self.faculty_owner_user, phone="318-605-5427", title="Professor"
        )
        self.student_enrolled_profile = StudentProfile.objects.create(
            user=self.student_enrolled_user, major="Comp Sci", classification="senior"
        )

        self.faculty_stranger_user = User.objects.create_user(
            email="lonsmith1@gmail.com",
            password="lonsmith123",
            first_name="lonnie",
            last_name="smithhie",
            role=Roles.FACULTY,
            cwid="30157209",
        )
        self.student_unenrolled_user = User.objects.create_user(
            email="georgesamuel765@gmail.com",
            password="lonsmith123",
            first_name="georgeyy",
            last_name="khawas",
            role=Roles.STUDENT,
            cwid="30157208",
        )
        self.faculty_stranger_profile = FacultyProfile.objects.create(
            user=self.faculty_stranger_user, phone="318-605-5428", title="Professor"
        )
        self.student_unenrolled_profile = StudentProfile.objects.create(
            user=self.student_unenrolled_user, major="Comp Sci", classification="senior"
        )

        self.programming_course = Course.objects.create(
            crn="12345",
            short_name="CS 101",
            name="Intro to Programming",
            faculty_profile=self.faculty_owner_profile
        )
        self.prog_course_roster = Roster.objects.create(
            course=self.programming_course,
            student_profile=self.student_enrolled_profile
        )
