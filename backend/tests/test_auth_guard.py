from datetime import timedelta

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app import security
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.security import issue_tokens
from tests.conftest import TestingSessionLocal

guarded = FastAPI()


@guarded.get("/private")
def private(user: User = Depends(get_current_user)):
    return {"id": user.id}


@pytest.fixture
def client(setup_db):
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    guarded.dependency_overrides[get_db] = override_get_db
    with TestClient(guarded) as c:
        yield c
    guarded.dependency_overrides.clear()


@pytest.fixture
def user(db_session):
    u = User(email="t@x.com", hashed_password="x", first_name="T", last_name="U")
    db_session.add(u)
    db_session.commit()
    return u


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def test_valid_access_token_passes(client, user):
    r = client.get("/private", headers=bearer(issue_tokens(user.id)["access_token"]))
    assert r.status_code == 200
    assert r.json() == {"id": user.id}


def test_missing_header_is_401(client):
    r = client.get("/private")
    assert r.status_code == 401
    assert r.headers["www-authenticate"] == "Bearer"


def test_garbage_token_is_401(client):
    assert client.get("/private", headers=bearer("nope")).status_code == 401


def test_non_bearer_scheme_is_401(client, user):
    token = issue_tokens(user.id)["access_token"]
    r = client.get("/private", headers={"Authorization": f"Basic {token}"})
    assert r.status_code == 401


def test_refresh_token_is_not_an_access_token(client, user):
    r = client.get("/private", headers=bearer(issue_tokens(user.id)["refresh_token"]))
    assert r.status_code == 401


def test_expired_token_is_401(client, user, monkeypatch):
    monkeypatch.setattr(security, "ACCESS_TTL", timedelta(seconds=-1))
    r = client.get("/private", headers=bearer(issue_tokens(user.id)["access_token"]))
    assert r.status_code == 401


def test_unknown_user_is_401(client):
    r = client.get("/private", headers=bearer(issue_tokens("no-such-user")["access_token"]))
    assert r.status_code == 401


def test_deactivated_user_is_401(client, db_session, user):
    user.is_active = False
    db_session.commit()
    r = client.get("/private", headers=bearer(issue_tokens(user.id)["access_token"]))
    assert r.status_code == 401
