import pytest


@pytest.mark.django_db
@pytest.mark.parametrize(
    "payload",
    [
        {
            "email": "georgesamuel764@gmail.com",
            "password": "lonsmith123",
            "password_confirm": "lonsmith123",
            "cwid": "30157203",
            "role": "FA",
            "first_name": "George",
            "last_name": "Khawas",
            "title": "Professor",
            "phone": "(318)605-5428",
        },
        {
            "email": "georgesamuel764@gmail.com",
            "password": "lonsmith123",
            "password_confirm": "lonsmith123",
            "cwid": "30157203",
            "role": "FA",
            "first_name": "George",
            "last_name": "Khawas",
            "title": "Professor",
            "phone": "318-605-5428",
        },
        {
            "email": "georgesamuel764@gmail.com",
            "password": "lonsmith123",
            "password_confirm": "lonsmith123",
            "cwid": "30157203",
            "role": "ST",
            "first_name": "George",
            "last_name": "Khawas",
            "major": "Computer Science",
            "classification": "Senior",
        },
    ],
)
def test_user_creation(payload, api_client, list_url):
    post_data = payload
    response = api_client.post(list_url, data=post_data)
    assert response.status_code == 201


@pytest.mark.django_db
@pytest.mark.parametrize(
    "client_fixture_name",
    [
        "student_client",
        "other_student_client",
        "faculty_client",
        "other_faculty_client",
    ],
)
def test_student_profile_retrieve(request, client_fixture_name, student_detail_url):
    active_client = request.getfixturevalue(client_fixture_name)
    response = active_client.get(student_detail_url)
    assert response.status_code == 200


@pytest.mark.django_db
def test_anon_cant_retrieve_student_profile(
    api_client, student_detail_url, failure_status_codes
):
    response = api_client.get(student_detail_url)
    assert response.status_code in failure_status_codes


@pytest.mark.django_db
@pytest.mark.parametrize(
    "client_fixture_name",
    [
        "student_client",
        "other_student_client",
        "faculty_client",
        "other_faculty_client",
    ],
)
def test_faculty_profile_retrieve(request, client_fixture_name, faculty_detail_url):
    active_client = request.getfixturevalue(client_fixture_name)
    response = active_client.get(faculty_detail_url)
    assert response.status_code == 200


@pytest.mark.django_db
def test_anon_cant_retrieve_faculty_profile(
    api_client, faculty_detail_url, failure_status_codes
):
    response = api_client.get(faculty_detail_url)
    assert response.status_code in failure_status_codes


@pytest.mark.django_db
def test_student_can_put_student_profile(student_client, student_detail_url):
    payload = {
        "user": {
            "first_name": "George",
            "last_name": "Khawas",
            "cwid": "30152303",
            "email": "georgesamuel234@gmail.com",
        },
        "major": "MLS",
        "classification": "Freshman",
    }
    response = student_client.put(student_detail_url, data=payload, format="json")
    assert response.status_code in [200, 204]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "payload",
    [
        {
            "user": {
                "first_name": "George",
                "last_name": "Khawas",
                "email": "georgesamuel234@gmail.com",
            },
            "major": "MLS",
            "classification": "Freshman",
        },
        {
            "user": {
                "cwid": "30152303",
                "role": "FA",
                "email": "georgesamuel234@gmail.com",
            },
        },
    ],
)
def test_student_put_negative_values(
    student_client, student_detail_url, payload, failure_status_codes
):
    response = student_client.put(student_detail_url, data=payload, format="json")
    assert response.status_code in failure_status_codes


@pytest.mark.django_db
@pytest.mark.parametrize(
    "client_fixture_name",
    ["faculty_client", "api_client", "other_student_client", "other_faculty_client"],
)
def test_non_student_cant_put_student_proflie(
    request, client_fixture_name, student_detail_url, failure_status_codes
):
    active_client = request.getfixturevalue(client_fixture_name)
    payload = {
        "user": {
            "first_name": "George",
            "last_name": "Khawas",
            "cwid": "30152303",
            "email": "georgesamuel234@gmail.com",
        },
        "major": "MLS",
        "classification": "Freshman",
    }
    response = active_client.put(student_detail_url, data=payload, format="json")
    assert response.status_code in failure_status_codes


@pytest.mark.django_db
def test_student_put_duplicate(student_client, student_detail_url, student_user):
    payload = {
        "user": {
            "first_name": "George",
            "last_name": "Khawas",
            "cwid": student_user.cwid,
            "email": student_user.email,
        },
        "major": "MLS",
        "classification": "Freshman",
    }
    response = student_client.put(student_detail_url, data=payload, format="json")
    print(response.data)
    assert response.status_code in [200, 204]


@pytest.mark.django_db
def test_faculty_can_put_faculty_profile(faculty_client, faculty_detail_url):
    payload = {
        "user": {
            "first_name": "George",
            "last_name": "Khawas",
            "cwid": "30152303",
            "email": "georgesamuel234@gmail.com",
        },
        "title": "Professor",
        "phone": "+13186055429",
    }
    response = faculty_client.put(faculty_detail_url, data=payload, format="json")
    assert response.status_code in [200, 204]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "payload",
    [
        {
            "user": {
                "first_name": "George",
                "last_name": "Khawas",
                "cwid": "30152303",
                "email": "georgesamuel234@gmail.com",
            },
            "phone": "000",
            "title": "Professor",
        },
        {
            "user": {
                "first_name": "George",
                "last_name": "Khawas",
                "cwid": "30152303",
                "email": "georgesamuel234@gmail.com",
            },
            "phone": "+13186055428",
        },
    ],
)
def test_faculty_put_negative_values(
    faculty_client, faculty_detail_url, payload, failure_status_codes
):
    response = faculty_client.put(faculty_detail_url, data=payload, format="json")
    assert response.status_code in failure_status_codes


@pytest.mark.django_db
@pytest.mark.parametrize(
    "client_fixture_name",
    ["student_client", "api_client", "other_student_client", "other_faculty_client"],
)
def test_non_faculty_cant_put_faculty_proflie(
    request, client_fixture_name, faculty_detail_url, failure_status_codes
):
    active_client = request.getfixturevalue(client_fixture_name)
    payload = {
        "user": {
            "first_name": "George",
            "last_name": "Khawas",
            "cwid": "30152303",
            "email": "georgesamuel234@gmail.com",
        },
        "title": "Professor",
        "phone": "+13186055429",
    }
    response = active_client.put(faculty_detail_url, data=payload, format="json")
    assert response.status_code in failure_status_codes


@pytest.mark.django_db
def test_duplicate_put_faculty(faculty_client, faculty_detail_url, faculty_user):
    payload = {
        "user": {
            "first_name": "George",
            "last_name": "Khawas",
            "cwid": faculty_user.cwid,
            "email": faculty_user.email,
        },
        "title": "Professor",
        "phone": "+13186055429",
    }
    response = faculty_client.put(faculty_detail_url, data=payload, format="json")
    assert response.status_code in [200, 204]
