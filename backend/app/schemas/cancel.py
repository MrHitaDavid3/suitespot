from datetime import date, datetime

from pydantic import BaseModel


class CancelResponse(BaseModel):
    """The reservation after POST /reservations/{id}/cancel."""

    model_config = {"from_attributes": True}

    id: str
    status: str
    room_id: str
    check_in_date: date
    check_out_date: date
    num_guests: int
    total_price: float
    updated_at: datetime | None