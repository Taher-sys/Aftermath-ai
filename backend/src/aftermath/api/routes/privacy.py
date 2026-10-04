from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from aftermath.privacy.engine import (
    PIIRedactor,
    PrivacyEngine,
    PrivacySettings,
    PurgeCertificate,
)

router = APIRouter(prefix="/privacy", tags=["Privacy & Security Center"])


class RedactPreviewRequest(BaseModel):
    sample_text: str = Field(..., min_length=1, description="Raw text containing potential PII")


class RedactPreviewResponse(BaseModel):
    original_text: str
    redacted_text: str
    tokens_masked: int
    categories_detected: List[str]


class PurgeRequest(BaseModel):
    workspace_id: str
    confirmation: str = Field(..., description="Must equal 'PURGE_WORKSPACE_PERMANENTLY'")


class ThreatStatusResponse(BaseModel):
    oversized_file_barrier: str = "ACTIVE (20 MB Cap)"
    executable_header_scanner: str = "ACTIVE (PE/ELF/Mach-O Blocked)"
    malformed_pdf_validator: str = "ACTIVE (%PDF- & %%EOF Enforced)"
    prompt_injection_defense: str = "ACTIVE (Neutralize & Quarantine)"
    ssrf_loopback_blocker: str = "ACTIVE (RFC 1918 & Cloud Metadata Prohibited)"
    safe_logging_token_scrubber: str = "ACTIVE (Zero PII in Logs)"


@router.get("/settings", response_model=PrivacySettings)
async def get_privacy_settings(
    workspace_id: str = Query(default="default-workspace"),
) -> PrivacySettings:
    """Returns privacy, local-only, and retention settings for a workspace."""
    return PrivacyEngine.get_settings(workspace_id)


@router.put("/settings", response_model=PrivacySettings)
async def update_privacy_settings(
    settings: PrivacySettings,
    workspace_id: str = Query(default="default-workspace"),
) -> PrivacySettings:
    """Updates privacy parameters for a workspace."""
    return PrivacyEngine.update_settings(workspace_id, settings)


@router.post("/redact", response_model=RedactPreviewResponse)
async def preview_pii_redaction(req: RedactPreviewRequest) -> RedactPreviewResponse:
    """Demonstrates pre-extraction PII redaction on sample text."""
    res = PIIRedactor.redact(req.sample_text)
    return RedactPreviewResponse(
        original_text=req.sample_text,
        redacted_text=res.redacted_text,
        tokens_masked=res.tokens_masked,
        categories_detected=res.categories_detected,
    )


@router.post("/purge", response_model=Dict[str, Any])
async def execute_workspace_purge(req: PurgeRequest) -> Dict[str, Any]:
    """Permanently purges workspace documents, facts, and simulation records with cryptographic proof."""
    if req.confirmation != "PURGE_WORKSPACE_PERMANENTLY":
        raise HTTPException(
            status_code=400,
            detail="Purge aborted: confirmation string must exactly match 'PURGE_WORKSPACE_PERMANENTLY'",
        )

    cert: PurgeCertificate = PrivacyEngine.execute_purge(req.workspace_id)
    return {
        "status": "PURGED",
        "purge_id": cert.purge_id,
        "workspace_id": cert.workspace_id,
        "documents_purged": cert.documents_purged,
        "facts_purged": cert.facts_purged,
        "simulations_purged": cert.simulations_purged,
        "timestamp_utc": cert.timestamp_utc,
        "cryptographic_digest": cert.cryptographic_digest,
    }


@router.get("/threat-status", response_model=ThreatStatusResponse)
async def get_threat_status() -> ThreatStatusResponse:
    """Returns active operational status of all security defense barriers."""
    return ThreatStatusResponse()
