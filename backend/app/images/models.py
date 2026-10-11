import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class HotelImage(Base):
    """One photo of a hotel. room_type is None for a hotel-wide photo."""

    __tablename__ = "hotel_images"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    hotel_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("hotels.id"), nullable=False, index=True
    )
    room_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Path under media/originals, e.g. "suitespot-downtown-san-jose/suite.jpg".
    file: Mapped[str] = mapped_column(String(255), nullable=False)
    alt: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    # Pixel size of the original, after EXIF rotation.
    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
