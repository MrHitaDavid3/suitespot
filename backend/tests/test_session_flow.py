"""5.2.4 Testing: log in and stay logged in (US5.2), end to end.

Walks a session the way the frontend does: call a guarded route, let the
access token expire, trade the refresh token at /auth/refresh, carry on.
Tokens come from issue_tokens() directly because POST /login doesn't exist yet.
"""
from datetime import timedelta

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app import security
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.routers import auth_tokens
from app.security import issue_tokens
from main import app as main_app
from tests.conftest import TestingSessionLocal

app = FastAPI()
app.include_router(auth_tokens.router)


@app.get("/private")
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

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def user(db_session):
    u = User(email="s@x.com", hashed_password="x", first_name="S", last_name="F")
    db_session.add(u)
    db_session.commit()
    return u


def get_private(client, access_token):
    return client.get("/private", headers={"Authorization": f"Bearer {access_token}"})


def refresh(client, refresh_token):
    return client.post("/auth/refresh", json={"refresh_token": refresh_token})


def test_expired_access_token_is_renewed_by_refresh(client, user, monkeypatch):
    monkeypatch.setattr(security, "ACCESS_TTL", timedelta(seconds=-1))
    tokens = issue_tokens(user.id)  # access token already expired

    r = get_private(client, tokens["access_token"])
    assert r.status_code == 401
    assert r.json()["detail"] == "Session expired. Please log in again."

    monkeypatch.undo()
    r = refresh(client, tokens["refresh_token"])
    assert r.status_code == 200
    renewed = r.json()

    r = get_private(client, renewed["access_token"])
    assert r.status_code == 200
    assert r.json() == {"id": user.id}


def test_session_survives_several_refreshes(client, user):
    tokens = issue_tokens(user.id)
    for _ in range(3):
        assert get_private(client, tokens["access_token"]).status_code == 200
        r = refresh(client, tokens["refresh_token"])
        assert r.status_code == 200
        tokens = r.json()
    assert get_private(client, tokens["access_token"]).status_code == 200


def test_old_refresh_token_still_works_after_refresh(client, user):
    # Known limit of stateless JWTs (see David's logout PR #22): a refresh
    # token stays valid until it expires, even after it has been traded in.
    old = issue_tokens(user.id)
    assert refresh(client, old["refresh_token"]).status_code == 200
    assert refresh(client, old["refresh_token"]).status_code == 200


def test_deactivated_mid_session_is_locked_out(client, db_session, user):
    tokens = issue_tokens(user.id)
    assert get_private(client, tokens["access_token"]).status_code == 200

    user.is_active = False
    db_session.commit()

    assert get_private(client, tokens["access_token"]).status_code == 401
    assert refresh(client, tokens["refresh_token"]).status_code == 401


def test_deleted_mid_session_is_locked_out(client, db_session, user):
    tokens = issue_tokens(user.id)
    db_session.delete(user)
    db_session.commit()

    assert get_private(client, tokens["access_token"]).status_code == 401
    assert refresh(client, tokens["refresh_token"]).status_code == 401


def test_logged_out_message_says_what_to_do(client):
    r = client.get("/private")
    assert r.status_code == 401
    assert r.json()["detail"] == "Please log in to continue."


def test_cors_allows_authorization_header_from_frontend():
    # authFetch sends Authorization from localhost:3000, so the browser
    # preflights; the real app must allow it.
    with TestClient(main_app) as c:
        r = c.options(
            "/auth/refresh",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type",
            },
        )
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "authorization" in r.headers["access-control-allow-headers"].lower()
