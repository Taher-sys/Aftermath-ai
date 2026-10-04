import hashlib
from pathlib import Path
from typing import Optional, Tuple

from aftermath.config import settings


class StorageVault:
    """Manages secure, deduplicated document binary storage."""

    def __init__(self, base_path: Optional[str] = None):
        self.base_dir = Path(base_path or settings.STORAGE_LOCAL_PATH)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def compute_sha256(content: bytes) -> str:
        """Computes hexadecimal SHA-256 hash of binary content."""
        hasher = hashlib.sha256()
        hasher.update(content)
        return hasher.hexdigest()

    def store_document_blob(self, content: bytes, extension: str = "") -> Tuple[str, str, int]:
        """Stores document content addressed by its SHA-256 hash.

        Returns:
            Tuple of (storage_path, sha256_hash, file_size_bytes)
        """
        sha256_hash = self.compute_sha256(content)
        file_size = len(content)

        # Subdirectory sharding to prevent directory crowding
        shard_dir = self.base_dir / sha256_hash[:2]
        shard_dir.mkdir(parents=True, exist_ok=True)

        ext = extension.lstrip(".")
        filename = f"{sha256_hash}.{ext}" if ext else sha256_hash
        target_path = shard_dir / filename

        # Atomic write if not already present
        if not target_path.exists():
            temp_path = shard_dir / f"{filename}.tmp"
            with open(temp_path, "wb") as f:
                f.write(content)
            temp_path.replace(target_path)

        return str(target_path), sha256_hash, file_size

    def read_document_blob(self, storage_path: str) -> bytes:
        """Reads document bytes from vault."""
        path = Path(storage_path)
        if not path.exists():
            raise FileNotFoundError(f"Blob at path '{storage_path}' not found in vault.")
        with open(path, "rb") as f:
            return f.read()
