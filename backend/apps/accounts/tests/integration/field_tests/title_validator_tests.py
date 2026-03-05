import pytest
from backend.apps.accounts.serializers import RegisterSerializer, Roles

@pytest.mark.django_db
@pytest.mark.parametrize("title, is_valid", [
    ("Professor", True),
    ("Proféssor", False),
    ("Dr.", True),
    ("", False),
    (" ", False),
    ("A" * 51, False),
    ("Assistant Professor", True),
    ("Assistant  Professor", False),
    ("A", False),
    ("TA", True),
    ("123", False),
    ("Professor!", False),
    ("Professor-Assistant", True),
    ("Dr..", False),
    ("Professor--Assistant", False),
    ("..", False),
    ("Professor-.Assistant", False),
])
def test_validate_title(title, is_valid):
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "username": "testuser",
        "email": "test@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "cwid": "12345678",
        "role": Roles.FACULTY,
        "title": title,
        "phone": "(318) 999-9999"
    }
    serializer = RegisterSerializer(data=data)
    valid = serializer.is_valid()
    assert valid == is_valid
    if not is_valid:
        assert "title" in serializer.errors