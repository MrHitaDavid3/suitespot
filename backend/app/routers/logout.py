"""POST /auth/logout: end the guest's session (US5.4, task 5.4.1).

Sessions are stateless JWTs (see app/security.py), so the server keeps nothing
to delete. Logging out means the client discards its access and refresh
tokens. This endpoint is the call the frontend makes when the user clicks
"Log out"; it always succeeds, even if the token is already expired, because
a user must always be able to log out.

Known limit: a token that was copied before logout stays valid until it
expires (15 min access, 7 days refresh). Revoking tokens server-side needs a
revocation table and a check in /auth/refresh; that is a separate change.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"detail": "Logged out."}