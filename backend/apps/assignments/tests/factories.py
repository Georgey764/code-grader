import factory
from django.utils import timezone
from apps.assignments.models import Assignment, RubricCriteria, TestCase
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


class TestCaseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TestCase

    id = factory.Faker("uuid4")
    assignment = factory.SubFactory(AssignmentFactory)

    input_file = factory.django.FileField(filename="input.txt", data=b"input data")
    expected_output_file = factory.django.FileField(
        filename="output.txt", data=b"expected output"
    )

    weight = factory.Faker(
        "pydecimal",
        left_digits=1,
        right_digits=2,
        positive=True,
        min_value=0.01,
        max_value=1,
    )
