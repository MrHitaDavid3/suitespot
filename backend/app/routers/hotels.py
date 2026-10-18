"""US1.2 hotel details with room-level date availability and images."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Hotel, Room
from app.images.models import HotelImage
from app.services.availability import is_room_available

router = APIRouter(prefix="/hotels", tags=["hotels"])

@router.get("/{hotel_id}")
def hotel_detail(hotel_id: str, check_in: date | None = Query(None, alias="checkIn"),
                 check_out: date | None = Query(None, alias="checkOut"),
                 guests: int = Query(1, ge=1, le=10), db: Session = Depends(get_db)):
    if (check_in is None) != (check_out is None):
        raise HTTPException(422, "Both checkIn and checkOut are required.")
    if check_in and (check_out <= check_in or check_in < date.today()):
        raise HTTPException(422, "Invalid stay dates.")
    hotel = db.get(Hotel, hotel_id)
    if hotel is None or not hotel.is_active:
        raise HTTPException(404, "Hotel not found.")
    rooms = db.scalars(select(Room).where(Room.hotel_id == hotel_id).order_by(Room.price_per_night)).all()
    images = db.scalars(select(HotelImage).where(HotelImage.hotel_id == hotel_id).order_by(HotelImage.position)).all()
    return {"id": hotel.id, "name": hotel.name, "description": hotel.description,
        "address": hotel.address, "city": hotel.city, "state": hotel.state,
        "country": hotel.country, "star_rating": hotel.star_rating, "image_url": hotel.image_url,
        "images": [{"room_type": i.room_type, "file": i.file, "alt": i.alt} for i in images],
        "rooms": [{"id": r.id, "room_number": r.room_number, "room_type": r.room_type,
                   "price_per_night": float(r.price_per_night), "max_guests": r.max_guests,
                   "available": bool(r.is_available and r.max_guests >= guests and
                      (not check_in or is_room_available(db, r.id, check_in, check_out)))} for r in rooms]}
