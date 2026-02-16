import factory
from factory.django import DjangoModelFactory
from apps.assessments.models import Submission, RubricResult, TestResult
from apps.courses.tests.factories import RosterFactory
from apps.assignments.tests.factories import (
    AssignmentFactory,
    RubricCriteriaFactory,
    TestCaseFactory,
    TestFileFactory,
)
from apps.groups.tests.factories import GroupFactory


class SubmissionFactory(DjangoModelFactory):
    class Meta:
        model = Submission

    roster = factory.SubFactory(RosterFactory)
    assignment = factory.SubFactory(AssignmentFactory)
    group = factory.SubFactory(GroupFactory)
    submitted_file = factory.SubFactory(TestFileFactory)


class RubricResultFactory(DjangoModelFactory):
    class Meta:
        model = RubricResult

    submission = factory.SubFactory(SubmissionFactory)
    rubric_criteria = factory.SubFactory(RubricCriteriaFactory)
    points_awarded = factory.Faker(
        "pyfloat", left_digits=2, right_digits=1, positive=True, max_value=100
    )
    optional_feedback = factory.Faker("sentence")


class TestResultFactory(DjangoModelFactory):
    class Meta:
        model = TestResult

    submission = factory.SubFactory(SubmissionFactory)
    test_case = factory.SubFactory(TestCaseFactory)

    status = factory.Iterator(["PASS", "FAIL", "ERROR", "TIMEOUT", "SKIPPED"])
    output_file = factory.SubFactory(TestFileFactory)
    error_message = factory.Maybe(
        factory.LazyAttribute(lambda o: o.status != "PASS"),
        yes_declaration=factory.Faker("paragraph"),
        no_declaration=None,
    )
    execution_time_ms = factory.Faker(
        "pyfloat", left_digits=3, right_digits=2, positive=True
    )
    points_earned = factory.Faker(
        "pyfloat", left_digits=2, right_digits=1, positive=True
    )
