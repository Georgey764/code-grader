import factory
import random
from apps.assessments.models import Submission, RubricResult, TestResult
from apps.courses.tests.factories import RosterFactory
from apps.assignments.tests.factories import (
    AssignmentFactory,
    TestFileFactory,
    RubricCriteriaFactory,
    TestCaseFactory,
)


class SubmissionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Submission

    id = factory.Faker("uuid4")
    roster = factory.SubFactory(RosterFactory)
    assignment = factory.SubFactory(AssignmentFactory)
    submitted_file = factory.SubFactory(TestFileFactory)

    # group is optional per your model; we'll leave it None by default
    group = None


class RubricResultFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RubricResult

    id = factory.Faker("uuid4")
    submission = factory.SubFactory(SubmissionFactory)
    rubric_criteria = factory.SubFactory(RubricCriteriaFactory)
    points_awarded = factory.LazyAttribute(lambda x: round(random.uniform(0, 10), 2))
    optional_feedback = factory.Faker("sentence")


class TestResultFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TestResult

    id = factory.Faker("uuid4")
    submission = factory.SubFactory(SubmissionFactory)
    test_case = factory.SubFactory(TestCaseFactory)

    # Randomly pick from your defined STATUS_CHOICES
    status = factory.Iterator(["PASS", "FAIL", "ERROR", "TIMEOUT", "SKIPPED"])

    actual_output = factory.Faker("paragraph")
    error_message = factory.Maybe(
        factory.SelfAttribute("status"),
        yes_declaration=factory.Faker("sentence"),
        no_declaration=None,
    )
    execution_time_ms = factory.LazyAttribute(lambda x: random.uniform(10.0, 500.0))
    points_earned = factory.LazyAttribute(lambda x: random.randint(0, 5))
