import re
from pathlib import Path

from PIL import Image, ImageOps

MEDIA_DIR = Path(__file__).resolve().parents[2] / "media"
ORIGINALS_DIR = MEDIA_DIR / "originals"
SIZED_DIR = MEDIA_DIR / "sized"

# Widths agreed with Pritika for the gallery (1.3.2): thumb for result cards,
# medium for the gallery, large for full-screen.
SIZES = {"thumb": 480, "medium": 1024, "large": 1920}
JPEG_QUALITY = 82

# EXIF orientations that turn the picture on its side.
_SIDEWAYS = {5, 6, 7, 8}


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def sized_name(file: str, size: str) -> str:
    """"hotel-slug/suite.jpg" -> "hotel-slug/suite-thumb.jpg"."""
    path = Path(file)
    return str(path.with_name(f"{path.stem}-{size}.jpg"))


def scaled_size(width: int, height: int, size: str) -> tuple[int, int]:
    """Pixel size of one generated copy. Never larger than the original."""
    w = min(SIZES[size], width)
    return w, max(1, round(height * w / width))


def original_size(src: Path) -> tuple[int, int]:
    """Width and height as displayed, i.e. after EXIF rotation."""
    with Image.open(src) as img:
        w, h = img.size
        if img.getexif().get(0x0112) in _SIDEWAYS:
            w, h = h, w
    return w, h


def build_sizes(file: str, originals: Path = ORIGINALS_DIR, sized: Path = SIZED_DIR) -> tuple[int, int]:
    """Write the thumb/medium/large JPGs for one original. Returns its (width, height).

    Copies newer than the original are left alone, so re-running is cheap.
    """
    src = originals / file
    outputs = {size: sized / sized_name(file, size) for size in SIZES}
    src_mtime = src.stat().st_mtime
    if all(p.exists() and p.stat().st_mtime >= src_mtime for p in outputs.values()):
        return original_size(src)

    with Image.open(src) as img:
        # Rotate per EXIF, then drop EXIF (camera/GPS data) by re-encoding.
        img = ImageOps.exif_transpose(img).convert("RGB")
        width, height = img.size
        for size, dest in outputs.items():
            dest.parent.mkdir(parents=True, exist_ok=True)
            copy = img.resize(scaled_size(width, height, size), Image.Resampling.LANCZOS)
            copy.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    return width, height
