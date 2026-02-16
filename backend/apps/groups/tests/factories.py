import factory
from factory.django import DjangoModelFactory
from apps.groups.models import Group, GroupsMembership
from apps.assignments.tests.factories import AssignmentFactory
from apps.courses.tests.factories import RosterFactory


class GroupFactory(DjangoModelFactory):
    class Meta:
        model = Group

    id = factory.Faker("uuid4")
    assignment = factory.SubFactory(AssignmentFactory)
    name = factory.Sequence(lambda n: f"Group {n}")
    max_members = 4


class GroupsMembershipFactory(DjangoModelFactory):
    class Meta:
        model = GroupsMembership

    id = factory.Faker("uuid4")
    group = factory.SubFactory(GroupFactory)
    roster = factory.SubFactory(RosterFactory)
    is_leader = False
