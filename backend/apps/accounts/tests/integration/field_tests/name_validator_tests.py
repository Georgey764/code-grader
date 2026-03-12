import pytest
from apps.accounts.serializers import RegisterSerializer, Roles

@pytest.mark.django_db
@pytest.mark.parametrize("name, is_valid", [
    ("John", True),   # Valid name
    (" John", True),  # Leading whitespace, should be stripped and valid
    ("John ", True),  # Trailing whitespace, should be stripped and valid
    ("", False),  # Empty name
    (" ", False),  # Name with only whitespace
    ("J", False),  # Too short
    ("J" * 51, False),  # Too long
    ("John123", False),  # Contains numbers
    ("John!", False),  # Contains special character
    ("Lily-Grace", True),  # Valid with hyphen
    ("D'shawn", True),  # Valid with apostrophe
    ("José", False),  # Contains non-ASCII character
    ("Mary Margaret", True),  # Valid with spaces
    ("O'Connor-Smith", True),  # Valid with apostrophe and hyphen
    ("Anna-Marie O'Neill", True),  # Valid with spaces, hyphen, and apostrophe
    ("Anna--Marie", False),  # Invalid with consecutive hyphens
    ("O''Connor", False),  # Invalid with consecutive apostrophes
    ("--", False),  # Invalid with only hyphens
    ("''", False),  # Invalid with only apostrophes
    ("-' ", False),  # Invalid with hyphen and apostrophe
])
def test_validate_name(name, is_valid):
    data = {
        "first_name": name,
        "last_name": name,
        "username": "testuser",
        "email": "test@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "cwid": "12345678",
        "role": Roles.STUDENT,
        "major": "Computer Science"
    }
    serializer = RegisterSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "first_name" in serializer.errors or "last_name" in serializer.errors

