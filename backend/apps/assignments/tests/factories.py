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

    assignment = factory.SubFactory(AssignmentFactory)
    input_data = factory.Faker("lexify", text="input_????")
    expected_output = factory.Faker("lexify", text="output_????")
    is_public = True
    # Using Decimal to match your DecimalField(max_digits=3, decimal_places=2)
    weight = factory.Faker(
        "pydecimal", left_digits=1, right_digits=2, min_value=0.1, max_value=1.0
    )
