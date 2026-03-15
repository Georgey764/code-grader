import pytest
from apps.accounts.serializers import RegisterSerializer

@pytest.mark.django_db
@pytest.mark.parametrize("password, is_valid", [
    ("?Password123", True),  # Valid password
    ("", False),  # Empty password
    ("         ", False),  # Only whitespace
    ("Pa1?", False),  # Too short
    ("Pass1234", False),  # No special character
    ("PASSWORD!123", False), # No lowercase letter
    ("password!123", False), # No uppercase letter
    ("Pa$$word", False),  # No number
    ("password123", False),  # No uppercase letter or special character
    ("PASSWORD123", False),  # No lowercase letter or special character
    ("Password", False),  # No number or special character
    ("12345678", False),  # No letters or special character
    ("!@#$%^&*", False),  # No letters or numbers  
    ("password", False),  # No uppercase letter, number, or special character
    ("PASSWORD", False),  # No lowercase letter, number, or special character
    ("Pässw0rd!", False),  # Contains a non-ASCII character
])
def test_validate_password(password, is_valid):
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "username": "testuser",
        "email": "test@example.com",
        "password": password,
        "password_confirm": password,
        "cwid": "12345678",
        "role": "ST"
    }
    serializer = RegisterSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "password" in serializer.errors