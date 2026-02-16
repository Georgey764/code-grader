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
        filename="student_code.py", data=b'print("hello world")'
    )


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
        min_value=0,
        max_value=20,
    )
    optional_feedback = factory.Faker("sentence")


class TestResultFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TestResult

    id = factory.Faker("uuid4")
    submission = factory.SubFactory(SubmissionFactory)
    test_case = factory.SubFactory(TestCaseFactory)
    status = factory.Iterator(["PASS", "FAIL", "ERROR", "TIMEOUT"])
    output_file = factory.django.FileField(
        filename="execution_output.txt", data=b"Actual output from code execution"
    )
    error_message = factory.Maybe(
        "status", yes_declaration=factory.Faker("text"), no_declaration=None
    )
    execution_time_ms = factory.Faker(
        "pyfloat", left_digits=3, right_digits=2, positive=True
    )
    points_earned = factory.Faker(
        "pyfloat", left_digits=1, right_digits=1, positive=True
    )
