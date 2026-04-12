from io import BytesIO

from PIL import Image, ImageOps, UnidentifiedImageError
from src.constants import ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES

MAX_IMAGE_WIDTH = 4000
MAX_IMAGE_HEIGHT = 4000
OUTPUT_MAX_SIZE = (1024, 1024)
OUTPUT_FORMAT = "JPEG"
OUTPUT_CONTENT_TYPE = "image/jpeg"
OUTPUT_QUALITY = 90

class ImageValidationError(Exception):
    pass


def validate_and_normalize_image(*, raw_bytes: bytes, content_type: str) -> tuple[bytes, str]:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ImageValidationError("Unsupported image type")

    if len(raw_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise ImageValidationError("Image file is too large")

    try:
        with Image.open(BytesIO(raw_bytes)) as image:
            # for full decoding, improve validation
            image.load()

            if image.width > MAX_IMAGE_WIDTH or image.height > MAX_IMAGE_HEIGHT:
                raise ImageValidationError("Image dimensions are too large")

            image = ImageOps.exif_transpose(image)
            image = image.convert("RGB")
            image.thumbnail(OUTPUT_MAX_SIZE)

            output = BytesIO()
            image.save(output, format=OUTPUT_FORMAT, quality=OUTPUT_QUALITY, optimize=True)

    except ImageValidationError:
        raise
    except UnidentifiedImageError as exc:
        raise ImageValidationError("Invalid image file") from exc
    except Exception as exc:
        raise ImageValidationError("Failed to process image") from exc

    return output.getvalue(), OUTPUT_CONTENT_TYPE