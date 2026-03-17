import pytest
from apps.courses.serializers import CourseSerializer

@pytest.mark.django_db
@pytest.mark.parametrize("description, is_valid", [
    ("This is a valid course description.", True),  # Valid description
    ("", True),  # Empty description is allowed
    ("A"*1001, False),  # Too long
    ("This description contains a non-ASCII character: ñ", False),  # Non-ASCII character
    ("", True),  # Empty description is valid
    ("<p>This description contains HTML tags.</p>", False),  # HTML tags are not allowed
    ("<script>alert('XSS')</script>", False)  # Script tags are not allowed
])
def test_validate_description(description, is_valid):
    data = {
        "crn": 12345,
        "short_name": "CS 101 ",
        "name": "Introduction to Computer Science",
        "description": description,
    }
    serializer = CourseSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "description" in serializer.errors