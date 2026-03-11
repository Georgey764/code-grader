import factory
from django.utils import timezone
from apps.assignments.models import (
    Assignment,
    RubricCriteria,
    TestCase,
    Group,
    GroupsMembership,
)
from apps.courses.tests.factories import CourseFactory, RosterFactory


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
    # Assumes you have an AssignmentFactory defined elsewhere
    assignment = factory.SubFactory(AssignmentFactory)

    input_text = "1\n1"
    expected_output = "2"
    time_limit = factory.Iterator([5, 10, 30])
    is_hidden = factory.Faker("boolean")
    points_possible = factory.Iterator([5, 10, 20])


class GroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Group

    id = factory.Faker("uuid4")
    assignment = factory.SubFactory(AssignmentFactory)
    name = factory.Sequence(lambda n: f"Group {n}")
    max_members = 4


class GroupsMembershipFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GroupsMembership

    id = factory.Faker("uuid4")
    group = factory.SubFactory(GroupFactory)
    roster = factory.SubFactory(RosterFactory)
    is_leader = False
