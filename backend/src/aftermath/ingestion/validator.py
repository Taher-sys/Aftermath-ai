from typing import Tuple

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB

SUPPORTED_MIME_TYPES = {
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "text/plain": "TXT",
    "image/png": "PNG",
    "image/jpeg": "JPEG",
    "image/tiff": "TIFF",
}

# Magic byte signatures
MAGIC_BYTES = {
    b"%PDF": "application/pdf",
    b"PK\x03\x04": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
    b"II*\x00": "image/tiff",
    b"MM\x00*": "image/tiff",
}


class ValidationError(Exception):
    """Raised when document validation fails."""

    pass


class DocumentValidator:
    """Validates uploaded files for size, true format, and security."""

    @staticmethod
    def validate_file(content: bytes, filename: str, declared_mime: str) -> Tuple[str, str]:
        """Validates file bytes and returns canonical MIME type and format category.

        Raises ValidationError if validation fails.
        """
        # 1. Size Check
        size = len(content)
        if size == 0:
            raise ValidationError("Uploaded file is empty (0 bytes).")
        if size > MAX_FILE_SIZE_BYTES:
            raise ValidationError(
                f"File size exceeds maximum allowed limit of 50 MB (received {size} bytes)."
            )

        # 2. Magic Byte & MIME Validation
        detected_mime = None
        for sig, mime in MAGIC_BYTES.items():
            if content.startswith(sig):
                detected_mime = mime
                break

        # Check plain text
        if detected_mime is None:
            if declared_mime == "text/plain" or filename.lower().endswith(".txt"):
                try:
                    content.decode("utf-8")
                    detected_mime = "text/plain"
                except UnicodeDecodeError:
                    raise ValidationError(
                        "File declared as plain text contains invalid binary encoding."
                    )

        if detected_mime is None:
            raise ValidationError(
                "Unsupported or malformed file type. Allowed formats: PDF, DOCX, TXT, PNG, JPEG."
            )

        # 3. PDF Active Code Sanitization Check
        if detected_mime == "application/pdf":
            # Scan for malicious PDF active action objects
            lower_content = content.lower()
            if (
                b"/javascript" in lower_content
                or b"/js " in lower_content
                or b"/launch" in lower_content
            ):
                raise ValidationError(
                    "File rejected: PDF contains embedded JavaScript or launch actions."
                )

        category = SUPPORTED_MIME_TYPES[detected_mime]
        return detected_mime, category
