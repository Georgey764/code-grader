import pytest
from apps.accounts.serializers import RegisterSerializer, Roles

@pytest.mark.django_db
@pytest.mark.parametrize("classification, is_valid", [
    ("freshman", True),
    ("sophomore", True),
    ("junior", True),
    ("senior", True),
    ("graduate", True),
    ("invalid", False),
    ("", False),
    (None, False)
])
def test_validate_classification(classification, is_valid):
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "username": "testuser",
        "email": "test@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "cwid": "12345678",
        "classification": classification,
        "role": Roles.STUDENT
    }
    serializer = RegisterSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "classification" in serializer.errors