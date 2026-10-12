from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.images.service import hotel_images
from app.models import Hotel

router = APIRouter(prefix="/hotels", tags=["images"])


@router.get("/{hotel_id}/images")
def get_hotel_images(hotel_id: str, request: Request, db: Session = Depends(get_db)):
    """Hotel and room-type photos with thumb/medium/large URLs (1.3.1)."""
    if db.get(Hotel, hotel_id) is None:
        raise HTTPException(status_code=404, detail="Hotel not found.")
    return hotel_images(db, hotel_id, str(request.base_url))
