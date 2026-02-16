import factory
from django.utils import timezone
from apps.assignments.models import Assignment, RubricCriteria, TestCase, TestFile
from apps.courses.tests.factories import CourseFactory


class AssignmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Assignment

    course = factory.SubFactory(CourseFactory)
    name = factory.Faker("catch_phrase")
    description = factory.Faker("paragraph")
    deadline = factory.LazyFunction(lambda: timezone.now() + timezone.timedelta(days=7))
    starter_code = "def main():\n    pass"
    max_points_allowed = 100
    is_grouped = False


class RubricCriteriaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RubricCriteria

    assignment = factory.SubFactory(AssignmentFactory)
    name = factory.Faker("word")
    description = factory.Faker("sentence")
    max_points = 25.0


class TestFileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TestFile

    name = factory.Faker("file_name", extension="txt")
    bucket = "test-bucket"
    key = factory.Sequence(lambda n: f"tests/file_{n}.txt")


class TestCaseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TestCase

    assignment = factory.SubFactory(AssignmentFactory)

    # Updated to use SubFactories for the new Foreign Key relationships
    test_input = factory.SubFactory(TestFileFactory)
    test_output = factory.SubFactory(TestFileFactory)

    # NUMERIC(3,2) allows up to 9.99
    weight = factory.Faker(
        "pydecimal",
        left_digits=1,
        right_digits=2,
        positive=True,
        min_value=0.01,
        max_value=9,
    )
