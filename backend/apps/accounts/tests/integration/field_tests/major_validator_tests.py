import pytest
from apps.accounts.serializers import RegisterSerializer, Roles

@pytest.mark.django_db
@pytest.mark.parametrize("major, is_valid", [
    ("AB", True),  # 2 chars
    ("A"*50, True),  # 50 chars
    ("A"*51, False),  # 51 chars
    ("Compüter Science", False),  # contains ü
    ("Computer-Science", False),  # hyphen not allowed
    ("Computer_Science", False),  # underscore not allowed
    ("Computer.Science", False),  # period not allowed
    ("Computer123", False),  # digits not allowed
    ("Computer Science", True),  # valid
    ("Comp Sci", True),  # valid
    ("Computer  Science", False),  # double space
    ("Comp  Sci", False),  # double space
    ("Comp Sci", True),  # single space
])
def test_validate_major(major, is_valid):
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "username": "testuser",
        "email": "test@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "cwid": "12345678",
        "role": Roles.STUDENT,
        "major": major
    }
    serializer = RegisterSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "major" in serializer.errors