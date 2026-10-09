from datetime import timedelta

import jwt
import pytest
from fastapi import HTTPException

from app import security
from app.models import User
from app.security import decode_token, issue_tokens


@pytest.fixture
def user(db_session):
    u = User(email="t@x.com", hashed_password="x", first_name="T", last_name="U")
    db_session.add(u)
    db_session.commit()
    return u


def test_issue_and_decode_round_trip():
    tokens = issue_tokens("abc")
    assert tokens["token_type"] == "bearer"
    assert decode_token(tokens["access_token"], "access")["sub"] == "abc"
    assert decode_token(tokens["refresh_token"], "refresh")["sub"] == "abc"


def test_wrong_type_rejected():
    tokens = issue_tokens("abc")
    with pytest.raises(HTTPException) as e:
        decode_token(tokens["access_token"], "refresh")
    assert e.value.status_code == 401


def test_expired_token_rejected(monkeypatch):
    monkeypatch.setattr(security, "ACCESS_TTL", timedelta(seconds=-1))
    with pytest.raises(HTTPException) as e:
        decode_token(issue_tokens("abc")["access_token"], "access")
    assert e.value.status_code == 401


def test_forged_token_rejected():
    forged = jwt.encode({"sub": "abc", "type": "access"}, "wrong-secret", algorithm="HS256")
    with pytest.raises(HTTPException):
        decode_token(forged, "access")


def test_refresh_returns_new_pair(client, user):
    old = issue_tokens(user.id)
    r = client.post("/auth/refresh", json={"refresh_token": old["refresh_token"]})
    assert r.status_code == 200
    body = r.json()
    assert decode_token(body["access_token"], "access")["sub"] == user.id
    assert decode_token(body["refresh_token"], "refresh")["sub"] == user.id


def test_refresh_rejects_access_token(client, user):
    r = client.post("/auth/refresh", json={"refresh_token": issue_tokens(user.id)["access_token"]})
    assert r.status_code == 401


def test_refresh_rejects_garbage_and_missing_user(client, user):
    assert client.post("/auth/refresh", json={"refresh_token": "nope"}).status_code == 401
    ghost = issue_tokens("no-such-user")["refresh_token"]
    assert client.post("/auth/refresh", json={"refresh_token": ghost}).status_code == 401


def test_refresh_rejects_deactivated_user(client, db_session, user):
    user.is_active = False
    db_session.commit()
    r = client.post("/auth/refresh", json={"refresh_token": issue_tokens(user.id)["refresh_token"]})
    assert r.status_code == 401
