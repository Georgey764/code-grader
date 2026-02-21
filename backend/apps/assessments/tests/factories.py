import factory
from apps.assessments.models import Submission, RubricResult, TestResult
from apps.assignments.tests.factories import (
    AssignmentFactory,
    RubricCriteriaFactory,
    TestCaseFactory,
)
from apps.courses.tests.factories import RosterFactory


class SubmissionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Submission

    id = factory.Faker("uuid4")
    roster = factory.SubFactory(RosterFactory)
    assignment = factory.SubFactory(AssignmentFactory)
    group = None
    submitted_file = factory.django.FileField(
        filename="submitted_code.py",
        data=b"a=int(input())\nb=int(input())\nprint(str(a+b))",
    )
    status = Submission.Status.PENDING


class RubricResultFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RubricResult

    id = factory.Faker("uuid4")
    submission = factory.SubFactory(SubmissionFactory)
    rubric_criteria = factory.SubFactory(RubricCriteriaFactory)
    points_awarded = factory.Faker(
        "pyfloat",
        left_digits=2,
        right_digits=1,
        positive=True,
        min_value=0.01,
        max_value=20,
    )
    optional_feedback = factory.Faker("sentence")


class TestResultFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TestResult

    id = factory.Faker("uuid4")
    submission = factory.SubFactory(SubmissionFactory)
    test_case = factory.SubFactory(TestCaseFactory)

    stdout = factory.Faker("text", max_nb_chars=200)
    stderr = ""
    exit_code = factory.Iterator([0, 1])
    duration = factory.Faker("pyfloat", left_digits=1, right_digits=2, positive=True)

    is_success = factory.LazyAttribute(lambda o: o.exit_code == 0)
