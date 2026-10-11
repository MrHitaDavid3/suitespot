"""1.3.1 Image storage + responsive sizes.

Originals live in backend/media/originals/<hotel-slug>/ and are listed in
app/seed/fixtures/images.json. `python -m app.images` (or the seed) builds the
480/1024/1920px copies into backend/media/sized/, which FastAPI serves at /media.
"""
