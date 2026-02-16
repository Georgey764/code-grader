import factory
from apps.courses.models import Course, Roster
from factory import SubFactory, Iterator, Faker
from apps.accounts.tests.factories import FacultyProfileFactory, StudentProfileFactory


class CourseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Course

    faculty_profile = SubFactory(FacultyProfileFactory)
    name = Faker("sentence", nb_words=4)
    short_name = Faker("bothify", text="???###")
    crn = factory.Sequence(lambda n: 10000 + n)
    is_active = True
    description = Faker("paragraph", nb_sentences=3)


class RosterFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Roster

    student_profile = SubFactory(StudentProfileFactory)
    course = SubFactory(CourseFactory)
