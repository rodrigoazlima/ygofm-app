#!/usr/bin/env python3
"""
Generate 48x48 JPEG thumbnails for all card images.

Input:  public/images/<original files>
Output: public/images/thumbs/<card_id>.jpg

Usage:
    python scripts/gen_thumbs.py          # skip existing
    python scripts/gen_thumbs.py --force  # regenerate all
"""

import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("Pillow not found. Run:  pip install Pillow")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "public" / "images"
THUMBS_DIR = IMAGES_DIR / "fm" / "thumbs"
LOCAL_IMAGES_JSON = ROOT / "src" / "data" / "localImages.json"

SIZE = 48
QUALITY = 82
FORCE = "--force" in sys.argv


def make_thumb(src: Path, dest: Path) -> None:
    with Image.open(src) as img:
        # center-crop to square then resize — matches CSS object-fit:cover
        thumb = ImageOps.fit(img.convert("RGB"), (SIZE, SIZE), Image.LANCZOS)
        thumb.save(dest, "JPEG", quality=QUALITY, optimize=True)


def main() -> None:
    THUMBS_DIR.mkdir(parents=True, exist_ok=True)

    with open(LOCAL_IMAGES_JSON, encoding="utf-8") as f:
        local_images: dict[str, str] = json.load(f)

    total = len(local_images)
    created = skipped = errors = 0

    for card_id, rel_path in local_images.items():
        dest = THUMBS_DIR / f"{card_id}.jpg"

        if dest.exists() and not FORCE:
            skipped += 1
            continue

        # rel_path is like "/images/DarkMagician-FMR-EN-VG.webp"
        src = ROOT / "public" / rel_path.lstrip("/")

        if not src.exists():
            print(f"  MISSING  [{card_id}] {src.name}")
            errors += 1
            continue

        try:
            make_thumb(src, dest)
            created += 1
            if created % 50 == 0:
                print(f"  {created + skipped}/{total} ...")
        except Exception as exc:
            print(f"  ERROR    [{card_id}] {src.name}: {exc}")
            errors += 1

    print(f"\n  created={created}  skipped={skipped}  errors={errors}  total={total}")


if __name__ == "__main__":
    main()
