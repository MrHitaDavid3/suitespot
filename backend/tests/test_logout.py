import pytest
from sqlalchemy import select

from app.models import User
from app.security import issue_tokens


@pytest.fixture
def user(db_session):
    u = User(email="out@x.com", hashed_password="x", first_name="O", last_name="U")
    db_session.add(u)
    db_session.commit()
    return u


def test_logout_with_valid_access_token(client, user):
    tokens = issue_tokens(user.id)
    response = client.post(
        "/auth/logout", headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    assert response.status_code == 200
    assert response.json() == {"detail": "Logged out."}


def test_logout_without_a_token_still_succeeds(client):
    assert client.post("/auth/logout").status_code == 200


@pytest.mark.parametrize("header", ["Bearer garbage", "Bearer ", "nonsense"])
def test_logout_with_bad_or_expired_token_still_succeeds(client, header):
    assert client.post("/auth/logout", headers={"Authorization": header}).status_code == 200


def test_logout_twice_is_fine(client):
    assert client.post("/auth/logout").status_code == 200
    assert client.post("/auth/logout").status_code == 200


def test_logout_requires_post(client):
    assert client.get("/auth/logout").status_code == 405


def test_logout_does_not_change_users(client, db_session, user):
    client.post("/auth/logout")
    assert len(db_session.execute(select(User)).scalars().all()) == 1


def test_refresh_endpoint_still_works(client, user):
    tokens = issue_tokens(user.id)
    response = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.xfail(reason="Stateless tokens: revoking a refresh token needs a revocation table (not built)")
def test_refresh_token_is_rejected_after_logout(client, user):
    tokens = issue_tokens(user.id)
    client.post("/auth/logout", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    response = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert response.status_code == 401