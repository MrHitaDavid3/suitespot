from sqlalchemy import select
from sqlalchemy.orm import Session

from app.images.models import HotelImage
from app.images.resize import SIZES, scaled_size, sized_name


def serialize(img: HotelImage, base_url: str) -> dict:
    """The shape agreed with Pritika for 1.3.2.

    `url`, `width` and `height` describe the large copy; the frontend can use
    width/height for the aspect ratio before the image loads.
    """
    base = base_url.rstrip("/")
    sizes = {size: f"{base}/media/{sized_name(img.file, size)}" for size in SIZES}
    width, height = scaled_size(img.width, img.height, "large")
    return {"url": sizes["large"], "alt": img.alt, "width": width, "height": height, "sizes": sizes}


def hotel_images(db: Session, hotel_id: str, base_url: str) -> dict:
    """Photos for one hotel: {"images": [...], "rooms": {room_type: [...]}}.

    `images` puts hotel-wide photos first, then room photos, so the first one
    is the cover even when a hotel only has room photos. No photos -> [].
    """
    rows = db.scalars(
        select(HotelImage)
        .where(HotelImage.hotel_id == hotel_id)
        .order_by(HotelImage.room_type.is_not(None), HotelImage.position)
    ).all()

    rooms: dict[str, list[dict]] = {}
    for row in rows:
        if row.room_type is not None:
            rooms.setdefault(row.room_type, []).append(serialize(row, base_url))
    return {"images": [serialize(row, base_url) for row in rows], "rooms": rooms}
