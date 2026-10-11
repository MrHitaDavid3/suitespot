import json
import os
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from PIL import Image

from app.database import get_db
from app.images.models import HotelImage
from app.images.resize import build_sizes, sized_name
from app.images.router import router
from app.models import Hotel
from app.seed.loader import load_images
from tests.conftest import TestingSessionLocal

HOTEL = {"name": "Test Inn", "city": "San Jose", "address": "1 Main St", "country": "US"}


def make_jpg(path: Path, width: int, height: int, orientation: int | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    exif = Image.Exif()
    if orientation:
        exif[0x0112] = orientation
    Image.new("RGB", (width, height), "teal").save(path, "JPEG", exif=exif)


def widths(sized: Path, file: str) -> dict[str, tuple[int, int]]:
    out = {}
    for size in ("thumb", "medium", "large"):
        with Image.open(sized / sized_name(file, size)) as img:
            out[size] = img.size
    return out


@pytest.fixture
def dirs(tmp_path):
    return tmp_path / "fixtures", tmp_path / "originals", tmp_path / "sized"


@pytest.fixture
def hotel(db_session):
    h = Hotel(**HOTEL)
    db_session.add(h)
    db_session.commit()
    return h


def write_manifest(fixtures: Path, entries: list[dict]) -> None:
    fixtures.mkdir(parents=True, exist_ok=True)
    (fixtures / "images.json").write_text(json.dumps(entries))


# --- resizing -------------------------------------------------------------

def test_builds_three_widths_keeping_aspect(dirs):
    _, originals, sized = dirs
    make_jpg(originals / "h/a.jpg", 4000, 3000)

    assert build_sizes("h/a.jpg", originals, sized) == (4000, 3000)
    assert widths(sized, "h/a.jpg") == {
        "thumb": (480, 360),
        "medium": (1024, 768),
        "large": (1920, 1440),
    }


def test_small_original_is_not_upscaled(dirs):
    _, originals, sized = dirs
    make_jpg(originals / "h/a.jpg", 800, 600)
    build_sizes("h/a.jpg", originals, sized)

    assert widths(sized, "h/a.jpg") == {
        "thumb": (480, 360),
        "medium": (800, 600),
        "large": (800, 600),
    }


def test_exif_rotation_is_applied(dirs):
    _, originals, sized = dirs
    make_jpg(originals / "h/a.jpg", 3000, 2000, orientation=6)  # stored sideways

    assert build_sizes("h/a.jpg", originals, sized) == (2000, 3000)
    assert widths(sized, "h/a.jpg")["thumb"] == (480, 720)
    with Image.open(sized / sized_name("h/a.jpg", "thumb")) as img:
        assert 0x0112 not in img.getexif()


def test_rebuild_skips_unchanged_files(dirs):
    _, originals, sized = dirs
    make_jpg(originals / "h/a.jpg", 2000, 1000)
    build_sizes("h/a.jpg", originals, sized)
    thumb = sized / sized_name("h/a.jpg", "thumb")
    os.utime(thumb, (thumb.stat().st_atime, thumb.stat().st_mtime + 100))
    before = thumb.stat().st_mtime

    assert build_sizes("h/a.jpg", originals, sized) == (2000, 1000)
    assert thumb.stat().st_mtime == before


# --- seed loader ----------------------------------------------------------

def test_load_images_inserts_and_is_idempotent(db_session, hotel, dirs):
    fixtures, originals, sized = dirs
    make_jpg(originals / "test-inn/lobby.jpg", 2000, 1000)
    make_jpg(originals / "test-inn/suite.jpg", 2000, 1000)
    write_manifest(fixtures, [
        {"hotel": "Test Inn", "city": "San Jose", "file": "lobby.jpg", "room_type": None, "alt": "Lobby"},
        {"hotel": "Test Inn", "city": "San Jose", "file": "suite.jpg", "room_type": "suite", "alt": "Suite"},
    ])

    assert load_images(db_session, fixtures, originals, sized) == 2
    assert load_images(db_session, fixtures, originals, sized) == 0
    rows = db_session.query(HotelImage).order_by(HotelImage.position).all()
    assert [(r.file, r.position, r.room_type, r.width) for r in rows] == [
        ("test-inn/lobby.jpg", 0, None, 2000),
        ("test-inn/suite.jpg", 1, "suite", 2000),
    ]
    assert (sized / "test-inn/suite-large.jpg").exists()


def test_load_images_skips_missing_file_and_hotel(db_session, hotel, dirs):
    fixtures, originals, sized = dirs
    write_manifest(fixtures, [
        {"hotel": "Test Inn", "city": "San Jose", "file": "nope.jpg", "room_type": None, "alt": ""},
        {"hotel": "Ghost Hotel", "city": "Nowhere", "file": "a.jpg", "room_type": None, "alt": ""},
    ])

    assert load_images(db_session, fixtures, originals, sized) == 0


def test_shipped_manifest_loads(db_session):
    # The real images.json must parse even before Elsa's photos arrive.
    load_images(db_session)


# --- endpoint -------------------------------------------------------------

app = FastAPI()
app.include_router(router)


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


def add_image(db, hotel, file, room_type=None, position=0, width=4000, height=3000):
    db.add(HotelImage(hotel_id=hotel.id, room_type=room_type, position=position,
                      file=file, alt=file, width=width, height=height))
    db.commit()


def test_unknown_hotel_is_404(client):
    assert client.get("/hotels/nope/images").status_code == 404


def test_hotel_without_photos_returns_empty_lists(client, hotel):
    r = client.get(f"/hotels/{hotel.id}/images")
    assert r.status_code == 200
    assert r.json() == {"images": [], "rooms": {}}


def test_response_shape(client, db_session, hotel):
    add_image(db_session, hotel, "test-inn/lobby.jpg")

    img = client.get(f"/hotels/{hotel.id}/images").json()["images"][0]
    base = "http://testserver/media/test-inn"
    assert img == {
        "url": f"{base}/lobby-large.jpg",
        "alt": "test-inn/lobby.jpg",
        "width": 1920,
        "height": 1440,
        "sizes": {
            "thumb": f"{base}/lobby-thumb.jpg",
            "medium": f"{base}/lobby-medium.jpg",
            "large": f"{base}/lobby-large.jpg",
        },
    }


def test_hotel_photos_come_first_then_rooms(client, db_session, hotel):
    add_image(db_session, hotel, "test-inn/suite.jpg", room_type="suite", position=0)
    add_image(db_session, hotel, "test-inn/pool.jpg", position=2)
    add_image(db_session, hotel, "test-inn/lobby.jpg", position=1)
    add_image(db_session, hotel, "test-inn/double.jpg", room_type="double", position=3)

    body = client.get(f"/hotels/{hotel.id}/images").json()
    assert [i["alt"] for i in body["images"]] == [
        "test-inn/lobby.jpg", "test-inn/pool.jpg", "test-inn/suite.jpg", "test-inn/double.jpg",
    ]
    assert {k: [i["alt"] for i in v] for k, v in body["rooms"].items()} == {
        "suite": ["test-inn/suite.jpg"],
        "double": ["test-inn/double.jpg"],
    }


def test_room_photo_is_cover_when_no_hotel_photos(client, db_session, hotel):
    add_image(db_session, hotel, "test-inn/single.jpg", room_type="single")

    body = client.get(f"/hotels/{hotel.id}/images").json()
    assert body["images"][0]["alt"] == "test-inn/single.jpg"
