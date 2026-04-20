import pytest
from apps.courses.serializers import CourseSerializer

@pytest.mark.django_db
@pytest.mark.parametrize("name, is_valid", [
    ("Intro to Programming I", True),  # Valid short name
    (" Intro to Programming I", True),  # Leading whitespace, should be stripped and valid
    ("Intro to Programming I ", True),  # Trailing whitespace, should be stripped and valid
    ("", False),  # Empty short name
    ("A"*256, False),  # Too long
    ("Intro@Programming I", False),  # Contains special character
    ("Introdüction to Programming I", False),  # Contains non-ASCII character
    ("Intro  to Programming  I", False),  # Contains consecutive spaces
    ("  ", False),  # Only spaces
 
    ])
def test_validate_short_name(name, is_valid):
    data = {
        "crn": 12345,
        "short_name": "CS 101 ",
        "name": name,
    }
    serializer = CourseSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "name" in serializer.errors