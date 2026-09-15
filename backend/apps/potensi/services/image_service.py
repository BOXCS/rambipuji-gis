"""
Image optimization service for uploaded photo files.

Resizes and compresses images on upload to reduce storage size
and improve page load performance. All output is converted to
JPEG to ensure consistent format and size across uploads.
"""

from __future__ import annotations

import io
import os
from typing import Union

from django.core.files.uploadedfile import InMemoryUploadedFile, UploadedFile
from PIL import Image, ImageOps

# Maximum output dimensions — preserves aspect ratio via thumbnail()
MAX_WIDTH: int = 1200
MAX_HEIGHT: int = 900

# JPEG quality setting (1–95); 82 balances quality vs. file size well
JPEG_QUALITY: int = 82


def optimize_image(
    uploaded_file: Union[InMemoryUploadedFile, UploadedFile]
) -> Union[InMemoryUploadedFile, UploadedFile]:
    """
    Resize and compress an uploaded image file.

    - Converts RGBA/P/LA mode to RGB (JPEG does not support alpha).
    - Auto-rotates based on EXIF orientation data.
    - Resizes down (never up) to fit within MAX_WIDTH × MAX_HEIGHT.
    - Saves as JPEG with JPEG_QUALITY compression.

    Returns an optimized InMemoryUploadedFile on success.
    On any Pillow failure, returns the original file unchanged so
    uploads are never silently dropped.
    """
    try:
        img: Image.Image = Image.open(uploaded_file)

        # ── Mode normalisation ──────────────────────────────────────────────
        if img.mode in ("RGBA", "P", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            # Paste using alpha channel as mask where available
            alpha = img.split()[-1] if img.mode in ("RGBA", "LA") else None
            background.paste(img, mask=alpha)
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # ── EXIF auto-rotation ──────────────────────────────────────────────
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass  # Silently skip if EXIF data is absent or malformed

        # ── Resize to fit within max dimensions ─────────────────────────────
        original_width, original_height = img.size
        if original_width > MAX_WIDTH or original_height > MAX_HEIGHT:
            img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)

        # ── Encode to JPEG buffer ───────────────────────────────────────────
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        buffer.seek(0)

        # ── Build output filename with .jpg extension ───────────────────────
        original_name: str = getattr(uploaded_file, "name", "foto.jpg") or "foto.jpg"
        base_name = os.path.splitext(os.path.basename(original_name))[0]
        new_name = f"{base_name}.jpg"

        optimized = InMemoryUploadedFile(
            file=buffer,
            field_name=None,
            name=new_name,
            content_type="image/jpeg",
            size=buffer.getbuffer().nbytes,
            charset=None,
        )
        return optimized

    except Exception:
        # If Pillow cannot open / process the file, return it unchanged.
        # Upstream validation already confirmed it is a valid image type.
        uploaded_file.seek(0)
        return uploaded_file
