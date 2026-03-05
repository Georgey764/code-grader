import pytest
from backend.apps.accounts.serializers import RegisterSerializer, Roles

@pytest.mark.django_db
@pytest.mark.parametrize("cwid, is_valid", [
    ("12345678", True),
    ("1234567890", True),
    ("-123456789", False),
    ("abcdefgh", False),
    ("1234abcd", False),
    ("", False),
    (" ", False),
    ("00000000", True),
    ("99999999", True),
    ("1234 5678", False),
    ("1234-5678", False)
])
def test_validate_cwid(cwid, is_valid):
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "username": "testuser",
        "email": "test@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "cwid": cwid,
        "role": Roles.STUDENT
    }
    serializer = RegisterSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "cwid" in serializer.errors