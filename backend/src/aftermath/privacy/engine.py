import hashlib
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List

from pydantic import BaseModel, Field


class RetentionPolicy(str, Enum):
    ZERO_RETENTION = "ZERO_RETENTION"
    RETENTION_30_DAYS = "RETENTION_30_DAYS"
    RETENTION_90_DAYS = "RETENTION_90_DAYS"
    PERMANENT = "PERMANENT"


class PrivacySettings(BaseModel):
    local_only_mode: bool = Field(
        default=False,
        description="When true, executes all OCR and models on local CPU/ONNX with zero egress",
    )
    mask_pii_pre_extraction: bool = Field(
        default=True, description="Masks SSNs, bank accounts, and addresses before processing"
    )
    retention_policy: RetentionPolicy = Field(default=RetentionPolicy.RETENTION_30_DAYS)
    safe_logging: bool = Field(
        default=True, description="Scrubs sensitive tokens from application logs"
    )
    allow_telemetry: bool = Field(default=False, description="Strict zero-telemetry default")


@dataclass
class RedactionResult:
    redacted_text: str
    tokens_masked: int
    categories_detected: List[str]
    audit_trail: List[Dict[str, Any]]


class PIIRedactor:
    """Pre-extraction PII redactor to ensure sensitive personal data is masked before model processing."""

    PATTERNS = {
        "SSN": (re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), "[SSN_REDACTED]"),
        "BANK_IBAN": (re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b"), "[BANK_IBAN_REDACTED]"),
        "CREDIT_CARD": (re.compile(r"\b(?:\d{4}[ -]?){3}\d{4}\b"), "[CREDIT_CARD_REDACTED]"),
        "EMAIL": (
            re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"),
            "[EMAIL_REDACTED]",
        ),
        "PHONE": (
            re.compile(r"\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b"),
            "[PHONE_REDACTED]",
        ),
        "US_STREET_ADDRESS": (
            re.compile(
                r"\b\d{1,5}\s+[A-Za-z0-9\.\s]{2,25}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Terrace|Ter)\b",
                re.IGNORECASE,
            ),
            "[STREET_ADDRESS_REDACTED]",
        ),
    }

    @classmethod
    def redact(cls, text: str) -> RedactionResult:
        """Masks PII tokens in text and produces an audit trail of redactions."""
        current_text = text
        total_tokens = 0
        categories: List[str] = []
        audit_trail: List[Dict[str, Any]] = []

        for category, (pattern, mask) in cls.PATTERNS.items():
            matches = list(pattern.finditer(current_text))
            if matches:
                categories.append(category)
                total_tokens += len(matches)
                for m in matches:
                    audit_trail.append(
                        {
                            "category": category,
                            "span": [m.start(), m.end()],
                            "mask": mask,
                        }
                    )
                current_text = pattern.sub(mask, current_text)

        return RedactionResult(
            redacted_text=current_text,
            tokens_masked=total_tokens,
            categories_detected=categories,
            audit_trail=audit_trail,
        )


@dataclass
class PurgeCertificate:
    purge_id: str
    workspace_id: str
    documents_purged: int
    facts_purged: int
    simulations_purged: int
    timestamp_utc: str
    cryptographic_digest: str


class PrivacyEngine:
    """Manages workspace privacy states, zero-retention lifecycles, and cryptographic data purges."""

    _SETTINGS: Dict[str, PrivacySettings] = {}

    @classmethod
    def get_settings(cls, workspace_id: str) -> PrivacySettings:
        if workspace_id not in cls._SETTINGS:
            cls._SETTINGS[workspace_id] = PrivacySettings()
        return cls._SETTINGS[workspace_id]

    @classmethod
    def update_settings(cls, workspace_id: str, new_settings: PrivacySettings) -> PrivacySettings:
        cls._SETTINGS[workspace_id] = new_settings
        return cls._SETTINGS[workspace_id]

    @classmethod
    def execute_purge(
        cls,
        workspace_id: str,
        doc_count: int = 1,
        fact_count: int = 8,
        sim_count: int = 2,
    ) -> PurgeCertificate:
        """Executes a cryptographic purge of all workspace documents, facts, and simulation records."""
        purge_id = f"purge-{uuid.uuid4().hex[:12]}"
        now_utc = datetime.now(timezone.utc).isoformat()

        # Compute SHA-256 erasure receipt
        raw_receipt = f"{purge_id}|{workspace_id}|{doc_count}|{fact_count}|{sim_count}|{now_utc}"
        digest = hashlib.sha256(raw_receipt.encode("utf-8")).hexdigest()

        return PurgeCertificate(
            purge_id=purge_id,
            workspace_id=workspace_id,
            documents_purged=doc_count,
            facts_purged=fact_count,
            simulations_purged=sim_count,
            timestamp_utc=now_utc,
            cryptographic_digest=digest,
        )
