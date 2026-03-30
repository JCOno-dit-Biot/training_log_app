from io import BytesIO

from PIL import Image
from src.constants import ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES

class ImageValidationError(Exception):
    pass


def validate_and_normalize_image(*, raw_bytes: bytes, content_type: str) -> tuple[bytes, str]:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ImageValidationError("Unsupported image type")

    if len(raw_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise ImageValidationError("Image file is too large")

    try:
        image = Image.open(BytesIO(raw_bytes)).convert("RGB")
    except Exception as exc:
        raise ImageValidationError("Invalid image file") from exc

    image.thumbnail((1024, 1024))

    output = BytesIO()
    image.save(output, format="JPEG", quality=90)
    return output.getvalue(), "image/jpeg"