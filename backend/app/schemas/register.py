from datetime import datetime

from pydantic import BaseModel


class RegisterResponse(BaseModel):
    """Public user data returned by POST /register. Never includes the password."""

    model_config = {"from_attributes": True}

    id: str
    email: str
    first_name: str
    last_name: str
    phone: str | None
    role: str
    created_at: datetime | None