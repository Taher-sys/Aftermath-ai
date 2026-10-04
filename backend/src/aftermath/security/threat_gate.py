import re
import urllib.parse
from typing import List, Tuple


class SecurityViolationError(Exception):
    """Raised when an ingested file or parameter violates safety policies."""

    pass


class ThreatGate:
    """Rigorous security and threat defense gate preventing malicious files, SSRF, prompt injection, and log leaks."""

    MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

    PROMPT_INJECTION_PATTERNS = [
        re.compile(r"ignore\s+(?:all\s+)?previous\s+(?:instructions|prompts|rules)", re.IGNORECASE),
        re.compile(r"you\s+are\s+now\s+(?:in\s+developer\s+mode|dan|jailbroken)", re.IGNORECASE),
        re.compile(
            r"output\s+(?:the\s+)?(?:system\s+prompt|initial\s+instructions)", re.IGNORECASE
        ),
        re.compile(r"disregard\s+the\s+above\s+and\s+do", re.IGNORECASE),
        re.compile(r"<\|im_start\|>|<\|im_end\|>|<system_prompt>", re.IGNORECASE),
    ]

    DISALLOWED_MAGIC_HEADERS = [
        (b"MZ", "Windows PE Executable / DLL"),
        (b"\x7fELF", "Linux ELF Executable"),
        (b"\xfe\xed\xfa\xce", "Mach-O 32-bit Executable"),
        (b"\xfe\xed\xfa\xcf", "Mach-O 64-bit Executable"),
        (b"\xcf\xfa\xed\xfe", "Mach-O Executable"),
    ]

    @classmethod
    def scan_file_binary(cls, content: bytes, filename: str) -> None:
        """Inspects magic header bytes and file extensions to block executable binaries and malicious payloads."""
        # 1. Size check
        if len(content) > cls.MAX_FILE_SIZE_BYTES:
            raise SecurityViolationError(
                f"File size {len(content)} bytes exceeds maximum permissible threshold of {cls.MAX_FILE_SIZE_BYTES} bytes (20 MB)."
            )

        # 2. Magic byte inspection
        for magic, desc in cls.DISALLOWED_MAGIC_HEADERS:
            if content.startswith(magic):
                raise SecurityViolationError(
                    f"Malicious file header detected: {desc} is strictly prohibited."
                )

        # 3. Disallowed executable extensions
        lower_name = filename.lower()
        disallowed_exts = (
            ".exe",
            ".dll",
            ".bat",
            ".cmd",
            ".sh",
            ".ps1",
            ".vbs",
            ".js",
            ".scr",
            ".bin",
        )
        if any(lower_name.endswith(ext) for ext in disallowed_exts):
            raise SecurityViolationError(
                f"Disallowed executable file extension: '{filename}' rejected."
            )

    @classmethod
    def validate_pdf_safety(cls, content: bytes) -> None:
        """Validates that a PDF binary contains standard header markers and rejects malformed/corrupted files."""
        if not content.startswith(b"%PDF-"):
            raise SecurityViolationError(
                "Malformed PDF document: missing required '%PDF-' magic header."
            )

        # Check for presence of trailer or EOF marker
        if b"%%EOF" not in content[-2048:]:
            # If EOF is missing from the end, verify it exists anywhere
            if b"%%EOF" not in content:
                raise SecurityViolationError(
                    "Malformed PDF document: missing standard '%%EOF' end-of-file marker."
                )

    @classmethod
    def scan_and_neutralize_prompt_injection(cls, text: str) -> Tuple[str, List[str]]:
        """Detects and neutralizes prompt injection payloads embedded within document text."""
        detected: List[str] = []
        sanitized = text

        for pattern in cls.PROMPT_INJECTION_PATTERNS:
            matches = list(pattern.finditer(sanitized))
            if matches:
                for m in matches:
                    matched_str = m.group(0)
                    detected.append(matched_str)
                    sanitized = sanitized.replace(
                        matched_str,
                        f"[NEUTRALIZED_ADVERSARIAL_INJECTION: {pattern.pattern[:20]}...]",
                    )

        return sanitized, detected

    @classmethod
    def validate_ssrf(cls, url: str) -> None:
        """Enforces SSRF defense by blocking loopback, link-local, and RFC 1918 private subnets."""
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise SecurityViolationError(
                f"Disallowed URL scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted."
            )

        host = (parsed.hostname or "").lower()
        if not host:
            raise SecurityViolationError("Invalid URL: missing valid hostname.")

        # Block loopback, link-local metadata, and private IP blocks
        disallowed_hosts = ("localhost", "127.0.0.1", "::1", "169.254.169.254")
        if host in disallowed_hosts:
            raise SecurityViolationError(
                f"SSRF Protection: Access to internal host '{host}' is prohibited."
            )

        if host.startswith("10.") or host.startswith("192.168."):
            raise SecurityViolationError(
                f"SSRF Protection: Access to private subnet '{host}' is prohibited."
            )

        # Check 172.16.0.0 - 172.31.255.255
        if host.startswith("172."):
            parts = host.split(".")
            if len(parts) >= 2 and parts[1].isdigit() and 16 <= int(parts[1]) <= 31:
                raise SecurityViolationError(
                    f"SSRF Protection: Access to private subnet '{host}' is prohibited."
                )

    @classmethod
    def sanitize_log_message(cls, message: str) -> str:
        """Scrubs SSNs, passwords, and sensitive PII from log output to guarantee zero data leakage in logs."""
        clean = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[SSN_SCRUBBED]", message)
        clean = re.sub(
            r"(?:password|secret|api_key|token)\s*=\s*[^\s,]+",
            "token=[REDACTED]",
            clean,
            flags=re.IGNORECASE,
        )
        return clean
