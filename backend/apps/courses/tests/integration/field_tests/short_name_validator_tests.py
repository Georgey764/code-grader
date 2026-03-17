import pytest
from apps.courses.serializers import CourseSerializer

@pytest.mark.django_db
@pytest.mark.parametrize("short_name, is_valid", [
    ("CS 101", True),  # Valid short name
    (" CS 101", True),  # Leading whitespace, should be stripped and valid
    ("CS 101 ", True),  # Trailing whitespace, should be stripped and valid
    ("", False),  # Empty short name
    ("A"*2, False),  # Too short
    ("A"*51, False),  # Too long
    ("CS@101", False),  # Contains special character
    ("ÇS 101", False),  # Contains non-ASCII character
    ("CS  101", False),  # Contains consecutive spaces
    ("  ", False),  # Only spaces
    ])
def test_validate_short_name(short_name, is_valid):
    data = {
        "crn": 12345,
        "short_name": short_name,
        "name": "Introduction to Computer Science",
    }
    serializer = CourseSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "short_name" in serializer.errors