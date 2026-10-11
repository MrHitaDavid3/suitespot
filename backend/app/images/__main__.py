"""Rebuild every resized copy: python -m app.images"""
from app.seed.loader import FIXTURES_DIR, _read_fixture
from app.images.resize import ORIGINALS_DIR, build_sizes, slugify


def main() -> None:
    built = missing = 0
    for entry in _read_fixture("images.json", FIXTURES_DIR):
        file = f"{slugify(entry['hotel'])}/{entry['file']}"
        if not (ORIGINALS_DIR / file).exists():
            print(f"Missing original: media/originals/{file}")
            missing += 1
            continue
        build_sizes(file)
        built += 1
    print(f"Built sizes for {built} images ({missing} missing).")


if __name__ == "__main__":
    main()
