from datetime import date, timedelta

import pytest

from app.models import Hotel, Reservation, Room, User
from app.services.availability import find_available_hotels, is_room_available

TODAY = date.today()
D = lambda n: TODAY + timedelta(days=n)  # noqa: E731

# Requested stay in every test: D(10) -> D(13)
CHECK_IN, CHECK_OUT = D(10), D(13)


@pytest.fixture
def world(db_session):
    user = User(email="t@x.com", hashed_password="x", first_name="T", last_name="U")
    hotel = Hotel(name="Test Inn", address="1 St", city="San Jose", country="US", star_rating=4)
    db_session.add_all([user, hotel])
    db_session.flush()
    room = Room(hotel_id=hotel.id, room_number="1", price_per_night=100, max_guests=2)
    db_session.add(room)
    db_session.commit()
    return {"user": user, "hotel": hotel, "room": room}


def book(db, world, start, end, status="confirmed"):
    db.add(
        Reservation(
            user_id=world["user"].id,
            room_id=world["room"].id,
            check_in_date=start,
            check_out_date=end,
            total_price=100,
            status=status,
        )
    )
    db.commit()


def available(db, world):
    return is_room_available(db, world["room"].id, CHECK_IN, CHECK_OUT)


def test_free_room_is_available(db_session, world):
    assert available(db_session, world)


@pytest.mark.parametrize(
    "start,end",
    [
        (D(8), D(10)),   # ends on our check-in day -> back to back, no conflict
        (D(13), D(15)),  # starts on our check-out day -> no conflict
        (D(1), D(5)),    # entirely before
    ],
)
def test_adjacent_or_distant_stays_do_not_block(db_session, world, start, end):
    book(db_session, world, start, end)
    assert available(db_session, world)


@pytest.mark.parametrize(
    "start,end",
    [
        (D(11), D(12)),  # fully inside
        (D(8), D(11)),   # overlaps the start
        (D(12), D(15)),  # overlaps the end
        (D(8), D(15)),   # fully contains our stay
        (D(10), D(13)),  # identical
    ],
)
def test_overlapping_stays_block(db_session, world, start, end):
    book(db_session, world, start, end)
    assert not available(db_session, world)


def test_cancelled_reservation_does_not_block(db_session, world):
    book(db_session, world, D(10), D(13), status="cancelled")
    assert available(db_session, world)


def test_pending_hold_blocks(db_session, world):
    book(db_session, world, D(10), D(13), status="pending")
    assert not available(db_session, world)


def test_unavailable_room_flag_blocks(db_session, world):
    world["room"].is_available = False
    db_session.commit()
    assert not available(db_session, world)


def test_find_hotels_matches_destination_and_guests(db_session, world):
    kwargs = dict(check_in=CHECK_IN, check_out=CHECK_OUT, guests=2)
    assert len(find_available_hotels(db_session, destination="san jose", **kwargs)) == 1
    assert find_available_hotels(db_session, destination="Tokyo", **kwargs) == []
    assert find_available_hotels(db_session, destination="San Jose", **{**kwargs, "guests": 3}) == []


def test_find_hotels_excludes_fully_booked(db_session, world):
    book(db_session, world, D(11), D(12))
    assert find_available_hotels(
        db_session, destination="San Jose", check_in=CHECK_IN, check_out=CHECK_OUT, guests=1
    ) == []


# --- endpoint ---

def _q(**over):
    q = {"destination": "San Jose", "checkIn": CHECK_IN.isoformat(), "checkOut": CHECK_OUT.isoformat(), "guests": 2}
    q.update(over)
    return q


def test_search_endpoint_returns_results(client, world):
    r = client.get("/search", params=_q())
    assert r.status_code == 200
    body = r.json()
    assert body["results"][0]["name"] == "Test Inn"
    assert body["results"][0]["rooms_available"] == 1
    assert body["results"][0]["from_price"] == 100.0


def test_search_endpoint_empty_is_200(client, world):
    r = client.get("/search", params=_q(destination="Atlantis"))
    assert r.status_code == 200
    assert r.json()["results"] == []


def test_search_endpoint_rejects_bad_dates(client, world):
    r = client.get("/search", params=_q(checkOut=CHECK_IN.isoformat()))
    assert r.status_code == 422
    r = client.get("/search", params=_q(checkIn=D(-3).isoformat()))
    assert r.status_code == 422


def test_search_endpoint_requires_destination(client):
    assert client.get("/search", params={"checkIn": CHECK_IN.isoformat(), "checkOut": CHECK_OUT.isoformat()}).status_code == 422


def test_search_endpoint_paginates(client, db_session, world):
    for i in range(3):
        h = Hotel(name=f"Extra {i}", address="x", city="San Jose", country="US")
        db_session.add(h)
        db_session.flush()
        db_session.add(Room(hotel_id=h.id, room_number="1", price_per_night=50, max_guests=2))
    db_session.commit()  # 4 hotels in San Jose now
    page1 = client.get("/search", params=_q(limit=3)).json()["results"]
    page2 = client.get("/search", params=_q(limit=3, offset=3)).json()["results"]
    assert len(page1) == 3 and len(page2) == 1
    assert not {h["id"] for h in page1} & {h["id"] for h in page2}
    assert client.get("/search", params=_q(limit=500)).status_code == 422
