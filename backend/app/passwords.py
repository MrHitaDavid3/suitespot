
import hashlib
import hmac
import secrets

_N = 2**14  # CPU/memory cost
_R = 8
_P = 1
_SALT_BYTES = 16
_KEY_BYTES = 32
_PREFIX = "scrypt"


def _derive(password: str, salt: bytes, n: int, r: int, p: int, length: int) -> bytes:
    return hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=n,
        r=r,
        p=p,
        dklen=length,
        maxmem=128 * n * r * 2,
    )


def hash_password(password: str) -> str:
    """Return a salted hash string that is safe to store in users.password_hash."""
    if not isinstance(password, str) or password == "":
        raise ValueError("Password must be a non-empty string.")
    salt = secrets.token_bytes(_SALT_BYTES)
    key = _derive(password, salt, _N, _R, _P, _KEY_BYTES)
    return f"{_PREFIX}${_N}${_R}${_P}${salt.hex()}${key.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Return True if password matches stored_hash. Never raises on bad input."""
    try:
        prefix, n, r, p, salt_hex, key_hex = stored_hash.split("$")
        if prefix != _PREFIX:
            return False
        expected = bytes.fromhex(key_hex)
        actual = _derive(
            password, bytes.fromhex(salt_hex), int(n), int(r), int(p), len(expected)
        )
    except (ValueError, AttributeError, TypeError):
        return False
    return hmac.compare_digest(actual, expected)