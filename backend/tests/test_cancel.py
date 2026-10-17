from datetime import date, datetime, timedelta, timezone

import pytest

from app.models import Hotel, Payment, Reservation, Room, User
from app.security import issue_tokens
from app.services.availability import is_room_available
from app.services.booking_availability import place_hold

TODAY = datetime.now(timezone.utc).date()
IN, OUT = TODAY + timedelta(days=10), TODAY + timedelta(days=13)


def make_user(db, email):
    u = User(email=email, hashed_password="x", first_name="T", last_name="U")
    db.add(u)
    db.commit()
    return u


def auth(user):
    return {"Authorization": f"Bearer {issue_tokens(user.id)['access_token']}"}


@pytest.fixture
def user(db_session):
    return make_user(db_session, "me@x.com")


@pytest.fixture
def other(db_session):
    return make_user(db_session, "other@x.com")


@pytest.fixture
def room(db_session):
    hotel = Hotel(name="H", address="1 Main", city="San Jose", country="US")
    db_session.add(hotel)
    db_session.flush()
    room = Room(hotel_id=hotel.id, room_number="101", price_per_night=100, max_guests=2)
    db_session.add(room)
    db_session.commit()
    return room


def reserve(db, user, room, status="pending", check_in=IN, check_out=OUT):
    r = Reservation(
        user_id=user.id, room_id=room.id, check_in_date=check_in, check_out_date=check_out,
        total_price=300, status=status,
    )
    db.add(r)
    db.commit()
    return r


def cancel(client, reservation_id, headers):
    return client.post(f"/reservations/{reservation_id}/cancel", headers=headers)


def status_of(db, reservation):
    db.expire_all()
    return db.get(Reservation, reservation.id).status


@pytest.mark.parametrize("start", ["pending", "confirmed"])
def test_owner_can_cancel(client, db_session, user, room, start):
    r = reserve(db_session, user, room, status=start)
    response = cancel(client, r.id, auth(user))
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "cancelled"
    assert body["id"] == r.id
    assert body["total_price"] == 300.0
    assert status_of(db_session, r) == "cancelled"


def test_response_has_no_user_or_payment_data(client, db_session, user, room):
    r = reserve(db_session, user, room)
    body = cancel(client, r.id, auth(user)).json()
    assert set(body) == {
        "id", "status", "room_id", "check_in_date", "check_out_date",
        "num_guests", "total_price", "updated_at",
    }


def test_cancelling_frees_the_room_for_those_dates(client, db_session, user, other, room):
    r = reserve(db_session, user, room, status="confirmed")
    assert is_room_available(db_session, room.id, IN, OUT) is False
    cancel(client, r.id, auth(user))
    assert is_room_available(db_session, room.id, IN, OUT) is True
    hold = place_hold(db_session, user_id=other.id, room_id=room.id, check_in=IN, check_out=OUT)
    assert hold.status == "pending"


def test_cancelling_twice_is_harmless(client, db_session, user, room):
    r = reserve(db_session, user, room)
    assert cancel(client, r.id, auth(user)).status_code == 200
    again = cancel(client, r.id, auth(user))
    assert again.status_code == 200
    assert again.json()["status"] == "cancelled"


def test_requires_login(client, db_session, user, room):
    r = reserve(db_session, user, room)
    assert client.post(f"/reservations/{r.id}/cancel").status_code == 401
    assert status_of(db_session, r) == "pending"


@pytest.mark.parametrize("header", ["Bearer garbage", "Bearer ", "nonsense"])
def test_bad_token_is_rejected(client, db_session, user, room, header):
    r = reserve(db_session, user, room)
    response = client.post(f"/reservations/{r.id}/cancel", headers={"Authorization": header})
    assert response.status_code == 401
    assert status_of(db_session, r) == "pending"


def test_cannot_cancel_someone_elses_reservation(client, db_session, user, other, room):
    r = reserve(db_session, user, room)
    response = cancel(client, r.id, auth(other))
    assert response.status_code == 404  # same answer as "doesn't exist"
    assert status_of(db_session, r) == "pending"


def test_unknown_reservation_is_404_and_names_the_field(client, user):
    response = cancel(client, "does-not-exist", auth(user))
    assert response.status_code == 404
    assert response.json()["detail"][0]["loc"] == ["path", "reservation_id"]


def test_stay_that_already_started_cannot_be_cancelled(client, db_session, user, room):
    r = reserve(db_session, user, room, status="confirmed",
                check_in=TODAY - timedelta(days=1), check_out=TODAY + timedelta(days=2))
    response = cancel(client, r.id, auth(user))
    assert response.status_code == 409
    assert response.json()["detail"][0]["type"] == "not_cancellable"
    assert status_of(db_session, r) == "confirmed"


def test_can_still_cancel_on_the_check_in_day(client, db_session, user, room):
    r = reserve(db_session, user, room, check_in=TODAY, check_out=TODAY + timedelta(days=2))
    assert cancel(client, r.id, auth(user)).status_code == 200
    assert status_of(db_session, r) == "cancelled"


def test_other_statuses_cannot_be_cancelled(client, db_session, user, room):
    r = reserve(db_session, user, room, status="completed")
    assert cancel(client, r.id, auth(user)).status_code == 409
    assert status_of(db_session, r) == "completed"


def test_only_that_reservation_changes(client, db_session, user, room):
    mine = reserve(db_session, user, room)
    later = reserve(db_session, user, room, check_in=OUT + timedelta(days=5), check_out=OUT + timedelta(days=7))
    cancel(client, mine.id, auth(user))
    assert status_of(db_session, later) == "pending"


def test_does_not_touch_payments_refunds_are_task_3_3_3(client, db_session, user, room):
    r = reserve(db_session, user, room, status="confirmed")
    p = Payment(reservation_id=r.id, amount=300, payment_method="card", status="succeeded")
    db_session.add(p)
    db_session.commit()
    cancel(client, r.id, auth(user))
    db_session.expire_all()
    assert db_session.get(Payment, p.id).status == "succeeded"


def test_get_is_not_allowed(client, db_session, user, room):
    r = reserve(db_session, user, room)
    assert client.get(f"/reservations/{r.id}/cancel", headers=auth(user)).status_code == 405