import pytest
from django.utils import timezone
from datetime import timedelta
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.assessments.serializers import (
    SubmissionSerializer, 
    RubricResultSerializer, 
    TestResultSerializer
)

# The actual imports for your team's factories!
from apps.assignments.tests.factories import AssignmentFactory, RubricCriteriaFactory, TestCaseFactory
from apps.courses.tests.factories import RosterFactory
from apps.assessments.tests.factories import SubmissionFactory, RubricResultFactory, TestResultFactory

@pytest.mark.django_db
def test_submission_deadline_rule():
    """Testing that the serializer blocks late submissions"""
    
    # 1. Setup Data using FactoryBoy
    assignment = AssignmentFactory(
        deadline=timezone.now() - timedelta(days=1), 
        is_grouped=False
    )
    roster = RosterFactory(course=assignment.course)
    
    dummy_file = SimpleUploadedFile("main.py", b"print('Hello World')", content_type="text/x-python")

    # 2. Build the data dictionary
    data = {
        "roster": roster.id,
        "assignment": assignment.id,
        "submitted_file": dummy_file
    }

    # 3. Test the Serializer directly
    serializer = SubmissionSerializer(data=data)
    is_valid = serializer.is_valid()

    # 4. Assert the Bouncer blocked it!
    assert is_valid is False
    assert "assignment" in serializer.errors
    assert str(serializer.errors["assignment"][0]) == "The deadline for this assignment has passed."


@pytest.mark.django_db
def test_rubric_result_grade_ceiling():
    """Testing that the serializer blocks grades that exceed max points"""
    
    # 1. Setup Data using FactoryBoy
    assignment = AssignmentFactory(max_points_allowed=100)
    submission = SubmissionFactory(assignment=assignment)
    
    # Create a rubric criteria that allows up to 120 points
    criteria = RubricCriteriaFactory(assignment=assignment, max_points=120)

    # 2. Build the data where the teacher tries to give 110 points
    data = {
        "submission": submission.id,
        "rubric_criteria": criteria.id,
        "points_awarded": 110.0 # Uh oh! 110 > 100!
    }

    # 3. Test the Serializer directly
    serializer = RubricResultSerializer(data=data)
    is_valid = serializer.is_valid()

    # 4. Assert the Bouncer blocked it!
    assert is_valid is False
    assert "points_awarded" in serializer.errors
    assert "exceeds the assignment's max_points_allowed" in str(serializer.errors["points_awarded"][0])


@pytest.mark.django_db
def test_submission_file_size_limit():
    """Testing that the serializer blocks files larger than 5MB"""
    
    assignment = AssignmentFactory(is_grouped=False)
    roster = RosterFactory(course=assignment.course)
    
    # Create a dummy file that is slightly larger than 5MB (5 * 1024 * 1024 bytes)
    massive_file_content = b"0" * ((5 * 1024 * 1024) + 1)
    dummy_file = SimpleUploadedFile("massive.py", massive_file_content, content_type="text/x-python")

    data = {
        "roster": roster.id,
        "assignment": assignment.id,
        "submitted_file": dummy_file
    }

    serializer = SubmissionSerializer(data=data)
    is_valid = serializer.is_valid()

    # Assert the Bouncer blocked the massive file
    assert is_valid is False
    assert "submitted_file" in serializer.errors
    assert "File size must not exceed 5MB." in str(serializer.errors["submitted_file"][0])


@pytest.mark.django_db
def test_submission_wrong_classroom_rule():
    """Testing that a student cannot submit to a course they aren't enrolled in"""
    
    # Create an assignment for Course A
    assignment = AssignmentFactory(is_grouped=False)
    
    # Create a roster ticket for Course B (FactoryBoy will automatically generate a different course)
    stranger_roster = RosterFactory() 
    
    dummy_file = SimpleUploadedFile("main.py", b"print('Hello World')", content_type="text/x-python")

    data = {
        "roster": stranger_roster.id,
        "assignment": assignment.id,
        "submitted_file": dummy_file
    }

    serializer = SubmissionSerializer(data=data)
    is_valid = serializer.is_valid()

    # Assert the Bouncer blocked the stranger!
    assert is_valid is False
    assert "roster" in serializer.errors
    assert "Student must be enrolled in the course" in str(serializer.errors["roster"][0])


@pytest.mark.django_db
def test_rubric_result_no_double_grading():
    """Testing that a teacher cannot grade the exact same criteria twice"""
    
    assignment = AssignmentFactory()
    submission = SubmissionFactory(assignment=assignment)
    criteria = RubricCriteriaFactory(assignment=assignment, max_points=10)
    
    # Simulate that the teacher ALREADY graded this criteria once
    RubricResultFactory(submission=submission, rubric_criteria=criteria, points_awarded=5)

    # Teacher tries to grade it a second time via the API
    data = {
        "submission": submission.id,
        "rubric_criteria": criteria.id,
        "points_awarded": 8
    }

    serializer = RubricResultSerializer(data=data)
    is_valid = serializer.is_valid()

    assert is_valid is False
    assert "rubric_criteria" in serializer.errors
    assert "already been graded" in str(serializer.errors["rubric_criteria"][0])


@pytest.mark.django_db
def test_test_result_no_double_jeopardy():
    """Testing that the automated grader cannot run the exact same test case twice"""
    
    assignment = AssignmentFactory()
    submission = SubmissionFactory(assignment=assignment)
    test_case = TestCaseFactory(assignment=assignment)
    
    # Simulate that the system ALREADY ran this test case once
    TestResultFactory(submission=submission, test_case=test_case)

    # System tries to record a second result for the exact same test case
    data = {
        "submission": submission.id,
        "test_case": test_case.id,
        "is_success": True
    }

    serializer = TestResultSerializer(data=data)
    is_valid = serializer.is_valid()

    assert is_valid is False
    assert "test_case" in serializer.errors
    assert "already exists" in str(serializer.errors["test_case"][0])