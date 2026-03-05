import pytest
from backend.apps.accounts.serializers import UserDetailSerializer, Roles

@pytest.mark.django_db
@pytest.mark.parametrize("email, is_valid", [
    ("test@example.com", True),
    ("invalid-email", False),
    ("", False),
    (" ", False),
    ("test@.com", False),
    ("test@com", False),
    ("test@domain.com", True),
    ("test@domain.co.uk", True),
    ("test@domain", False),
    ("test@domain.c", False),
    ("test.user@example.com", True),
    ("test+user@example.com", True),
    ("test user@example.com", False),
    ("tést@example.com", False),
    ("TEST@EXAMPLE.COM", True),
    ("user@mail.example.com", True),
    ("user..name@example.com", False),
    ("test@@example.com", False),
    ("\"test\"@example.com", True)
])
def test_validate_email(email, is_valid):
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "username": "testuser",
        "email": email,
        "password": "Password123!",
        "cwid": "12345678",
        "role": Roles.STUDENT
    }
    serializer = UserDetailSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "email" in serializer.errors