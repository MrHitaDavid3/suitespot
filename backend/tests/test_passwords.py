import pytest

from app.security.passwords import hash_password, verify_password


def test_hash_is_not_the_plain_password():
    assert "CorrectHorse1" not in hash_password("CorrectHorse1")


def test_correct_password_verifies():
    stored = hash_password("CorrectHorse1")
    assert verify_password("CorrectHorse1", stored) is True


def test_wrong_password_fails():
    stored = hash_password("CorrectHorse1")
    assert verify_password("correcthorse1", stored) is False


def test_same_password_gets_different_hashes():
    assert hash_password("CorrectHorse1") != hash_password("CorrectHorse1")


def test_unicode_and_long_passwords_work():
    for pw in ["pässwörd-密码-🔑", "x" * 128]:
        assert verify_password(pw, hash_password(pw)) is True


@pytest.mark.parametrize("bad", ["", "garbage", "scrypt$1$2", "md5$1$1$1$aa$bb", "scrypt$x$y$z$zz$zz"])
def test_malformed_stored_hash_returns_false(bad):
    assert verify_password("CorrectHorse1", bad) is False


def test_non_string_stored_hash_returns_false():
    assert verify_password("CorrectHorse1", None) is False


@pytest.mark.parametrize("bad", ["", None, 123])
def test_hash_rejects_empty_or_non_string(bad):
    with pytest.raises(ValueError):
        hash_password(bad)