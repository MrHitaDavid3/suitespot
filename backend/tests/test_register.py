import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.security.passwords import verify_password

VALID = {
    "email": "Jane@Example.com",
    "password": "Passw0rdOK",
    "first_name": "Jane",
    "last_name": "Doe",
    "phone": "408-555-0100",
}


def test_register_success_returns_201_and_public_fields(client):
    response = client.post("/register", json=VALID)
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "jane@example.com"
    assert body["first_name"] == "Jane"
    assert body["role"] == "guest"
    assert body["id"]


def test_response_never_contains_password_data(client):
    body = client.post("/register", json=VALID).json()
    assert "password" not in body
    assert "hashed_password" not in body


def test_password_is_stored_hashed_and_verifies(client, db_session):
    client.post("/register", json=VALID)
    user = db_session.execute(select(User)).scalar_one()
    assert user.hashed_password != VALID["password"]
    assert verify_password(VALID["password"], user.hashed_password)


def test_names_and_phone_are_optional(client, db_session):
    response = client.post(
        "/register", json={"email": "min@example.com", "password": "Passw0rdOK"}
    )
    assert response.status_code == 201
    assert response.json()["first_name"] == ""
    assert response.json()["phone"] is None


def test_duplicate_email_returns_409(client):
    client.post("/register", json=VALID)
    response = client.post("/register", json=VALID)
    assert response.status_code == 409


def test_duplicate_email_is_case_insensitive(client):
    client.post("/register", json=VALID)
    response = client.post("/register", json={**VALID, "email": "JANE@EXAMPLE.COM"})
    assert response.status_code == 409


def test_duplicate_does_not_create_second_user(client, db_session):
    client.post("/register", json=VALID)
    client.post("/register", json=VALID)
    assert len(db_session.execute(select(User)).scalars().all()) == 1


def test_invalid_email_returns_422(client):
    assert client.post("/register", json={**VALID, "email": "not-an-email"}).status_code == 422


def test_short_password_returns_422(client):
    assert client.post("/register", json={**VALID, "password": "a1"}).status_code == 422


def test_password_without_number_returns_422(client):
    assert client.post("/register", json={**VALID, "password": "onlyletters"}).status_code == 422


def test_missing_email_or_password_returns_422(client):
    assert client.post("/register", json={"password": "Passw0rdOK"}).status_code == 422
    assert client.post("/register", json={"email": "a@b.com"}).status_code == 422


def test_cannot_register_as_admin(client, db_session):
    response = client.post("/register", json={**VALID, "role": "admin"})
    assert response.status_code == 422
    assert db_session.execute(select(User)).first() is None


def test_duplicate_error_names_the_email_field(client):
    client.post("/register", json=VALID)
    detail = client.post("/register", json=VALID).json()["detail"]
    assert detail[0]["loc"] == ["body", "email"]
    assert "already exists" in detail[0]["msg"]


def test_validation_error_names_the_bad_field(client):
    detail = client.post("/register", json={**VALID, "password": "abcdefgh"}).json()["detail"]
    assert detail[0]["loc"] == ["body", "password"]


def test_race_on_unique_email_returns_409_not_500(client, monkeypatch):
    """Two sign-ups pass the duplicate check at once; the DB constraint must still give 409."""
    from sqlalchemy.orm import Session

    def boom(self):
        raise IntegrityError("INSERT", {}, Exception("UNIQUE constraint failed: users.email"))

    monkeypatch.setattr(Session, "commit", boom)
    response = client.post("/register", json=VALID)
    assert response.status_code == 409


@pytest.mark.xfail(reason="RegisterRequest strips spaces from passwords but LoginRequest does not")
def test_password_is_not_silently_modified(client, db_session):
    client.post("/register", json={**VALID, "password": "  Passw0rd1  "})
    user = db_session.execute(select(User)).scalar_one()
    assert verify_password("  Passw0rd1  ", user.hashed_password)


@pytest.mark.xfail(reason="Blank optional names from a web form ('') are rejected with 422")
@pytest.mark.parametrize("field", ["first_name", "last_name"])
def test_blank_optional_name_is_accepted(client, field):
    response = client.post("/register", json={**VALID, field: ""})
    assert response.status_code == 201