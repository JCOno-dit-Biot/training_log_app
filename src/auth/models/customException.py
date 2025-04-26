from typing import Optional, Any


class CustomValidationException(Exception):
    def __init__(self, message: str, field: str):
        self.message = message
        self.field = field
        super().__init__(self.message)

# Exception for invalid token format
class InvalidHeaderFormatException(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class TokenDecodeError(Exception):
    pass