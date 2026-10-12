"""1.1.2 Availability query: date-range overlap.

A stay is the half-open range [check_in, check_out): the check-out day is
free, so back-to-back stays never conflict. Only cancelled reservations free
a room; pending reservations (the hold from 2.1.2) still block it.

Reused later by:
  - 1.4.1 / 1.5.1  add filters and sorting to find_available_hotels
  - 2.1.2          re-check availability at booking time (is_room_available)
"""
from datetime import date
from typing import Literal, get_args

from sqlalchemy import exists, func, or_, select
from sqlalchemy.orm import Session

from app.models import Hotel, Reservation, Room

# Reservation statuses that do NOT hold a room.
FREE_STATUSES = ("cancelled",)

# 1.5.1 Sort options for search results. These match the values the frontend
# SortControl sends. "recommended" is the default and currently orders by name.
# Distance isn't supported yet: hotels have no latitude/longitude columns.
SortOption = Literal["recommended", "price_asc", "price_desc", "rating"]


def _ordering(sort: str) -> list:
    """ORDER BY terms for a sort option. Hotel.id is always last so paging is stable."""
    from_price = func.min(Room.price_per_night)
    orderings = {
        "recommended": [Hotel.name],
        "price_asc": [from_price.asc(), Hotel.name],
        "price_desc": [from_price.desc(), Hotel.name],
        "rating": [Hotel.star_rating.desc(), from_price.asc(), Hotel.name],
    }
    if sort not in orderings:
        raise ValueError(f"sort must be one of {get_args(SortOption)}, got {sort!r}")
    return [*orderings[sort], Hotel.id]


def _room_is_booked(check_in: date, check_out: date):
    """Correlated EXISTS: this room has a holding reservation overlapping the range."""
    return exists().where(
        Reservation.room_id == Room.id,
        Reservation.status.not_in(FREE_STATUSES),
        Reservation.check_in_date < check_out,  # starts before the requested end
        Reservation.check_out_date > check_in,  # ends after the requested start
    )


def is_room_available(
    db: Session, room_id: str, check_in: date, check_out: date
) -> bool:
    stmt = select(Room.id).where(
        Room.id == room_id,
        Room.is_available.is_(True),
        ~_room_is_booked(check_in, check_out),
    )
    return db.scalar(stmt) is not None


def find_available_hotels(
    db: Session,
    *,
    destination: str,
    check_in: date,
    check_out: date,
    guests: int,
    sort: SortOption = "recommended",
    limit: int = 20,
    offset: int = 0,
) -> list[dict]:
    """Hotels with at least one free room that fits the party for the dates."""
    destination = destination.strip()
    stmt = (
        select(
            Hotel.id,
            Hotel.name,
            Hotel.city,
            Hotel.state,
            Hotel.star_rating,
            Hotel.image_url,
            func.count(Room.id).label("rooms_available"),
            func.min(Room.price_per_night).label("from_price"),
        )
        .join(Room, Room.hotel_id == Hotel.id)
        .where(
            Hotel.is_active.is_(True),
            Room.is_available.is_(True),
            Room.max_guests >= guests,
            or_(
                Hotel.city.icontains(destination, autoescape=True),
                Hotel.state.icontains(destination, autoescape=True),
                Hotel.name.icontains(destination, autoescape=True),
            ),
            ~_room_is_booked(check_in, check_out),
        )
        .group_by(Hotel.id)
        .order_by(*_ordering(sort))
        .limit(limit)
        .offset(offset)
    )
    rows = db.execute(stmt).mappings().all()
    return [{**row, "from_price": float(row["from_price"])} for row in rows]
