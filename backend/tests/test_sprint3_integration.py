from datetime import date, timedelta
from app.models import Hotel, Room


def test_login_registration_and_protected_booking(client, db_session):
    credentials = {"email": "sprint3@example.com", "password": "securePassword123", "first_name": "A", "last_name": "B"}
    assert client.post("/register", json=credentials).status_code == 201
    assert client.post("/login", json={"email": credentials["email"], "password": "bad"}).status_code == 401
    result = client.post("/login", json={"email": credentials["email"], "password": credentials["password"]})
    assert result.status_code == 200, result.text
    token = result.json()["access_token"]
    hotel = Hotel(name="Sprint Hotel", address="1 Test St", city="San Jose", country="US", star_rating=4)
    db_session.add(hotel); db_session.flush()
    room = Room(hotel_id=hotel.id, room_number="123", room_type="double", max_guests=2, price_per_night=200)
    db_session.add(room); db_session.commit()
    start = date.today() + timedelta(days=10)
    end = start + timedelta(days=2)
    body = {"room_id": room.id, "check_in": start.isoformat(), "check_out": end.isoformat(), "num_guests": 2}
    assert client.post("/reservations", json=body).status_code == 401
    response = client.post("/reservations", json=body, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201, response.text
    assert response.json()["status"] == "pending"
    assert client.post("/reservations", json=body, headers={"Authorization": f"Bearer {token}"}).status_code == 409
    detail = client.get(f"/hotels/{hotel.id}", params={"checkIn": start.isoformat(), "checkOut": end.isoformat()})
    assert detail.status_code == 200
    assert detail.json()["rooms"][0]["available"] is False
    search = client.get("/search", params={"destination": "San Jose", "checkIn": start.isoformat(), "checkOut": end.isoformat(), "guests": 2})
    assert search.status_code == 200
    assert search.json()["results"] == []


def test_price_star_room_filters(client, db_session):
    hotel = Hotel(name="Filter Hotel", address="1 Test St", city="San Jose", country="US", star_rating=4)
    db_session.add(hotel); db_session.flush()
    db_session.add(Room(hotel_id=hotel.id, room_number="200", room_type="suite", max_guests=2, price_per_night=250))
    db_session.commit()
    start = date.today() + timedelta(days=20)
    base = {"destination": "San Jose", "checkIn": start.isoformat(), "checkOut": (start + timedelta(days=2)).isoformat()}
    assert len(client.get("/search", params={**base, "minPrice": 200, "minStars": 4, "roomType": "suite"}).json()["results"]) == 1
    assert not client.get("/search", params={**base, "maxPrice": 100}).json()["results"]
    assert not client.get("/search", params={**base, "minStars": 5}).json()["results"]
