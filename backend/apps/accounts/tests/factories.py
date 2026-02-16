import factory
from factory import Sequence, LazyAttribute, Iterator, SubFactory, Faker
from apps.accounts.models import User, FacultyProfile, StudentProfile, Roles
from django.contrib.auth.hashers import make_password


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = Sequence(lambda n: f"user-{n}@gmail.com")
    password = LazyAttribute(lambda _: make_password("testpass123"))
    first_name = Faker("first_name")
    last_name = Faker("last_name")
    cwid = Sequence(lambda n: f"{n:010d}")
    role = Roles.STUDENT

    class Params:
        student = factory.Trait(role=Roles.STUDENT)
        faculty = factory.Trait(role=Roles.FACULTY)

    # @factory.post_generation
    # def create_profiles(self, create, extracted, **kwargs):
    #     if not create:
    #         return

    #     if self.role == Roles.FACULTY:
    #         FacultyProfile.objects.get_or_create(user=self)
    #     elif self.role == Roles.STUDENT:
    #         StudentProfile.objects.get_or_create(user=self)


MAJORS = [
    "Computer Science",
    "Medical Laboratory Science",
    "Mathematics",
    "Nursing",
    "Accounting",
    "Risk Management Insurance",
]

CLASSIFICATION = ["Freshman", "Sophomore", "Junior", "Senior"]


class StudentProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = StudentProfile

    user = SubFactory(UserFactory, student=True)
    major = Iterator(MAJORS)
    classification = Iterator(CLASSIFICATION)


class FacultyProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FacultyProfile

    user = SubFactory(UserFactory, faculty=True)
    title = Faker("job")
    phone = Faker("numerify", text="+1318605####")
