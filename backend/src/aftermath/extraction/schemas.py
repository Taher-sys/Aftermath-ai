import uuid
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class RawSourceSpan(BaseModel):
    page_number: int = Field(..., ge=1, description="1-based page index")
    char_start: int = Field(..., ge=0, description="0-based character start offset in page text")
    char_end: int = Field(..., ge=0, description="0-based character end offset in page text")
    verbatim_text: str = Field(..., min_length=1, description="Verbatim substring from document")


class ExtractedFactCandidate(BaseModel):
    fact_key: str = Field(..., description="Canonical key: e.g., BASE_RENT, NOTICE_PERIOD")
    raw_value: str = Field(..., description="Text as it appears in document")
    normalized_value: Dict[str, Any] = Field(
        default_factory=dict, description="Parsed structured value"
    )
    data_type: str = Field(..., description="CURRENCY, DATE, DURATION, TEXT, MODAL_DUTY")
    epistemic_tier: str = Field(default="EXTRACTED_FACT")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    extraction_method: str = Field(default="REGEX_DETERMINISTIC")
    span: RawSourceSpan


class ExtractionResult(BaseModel):
    document_id: uuid.UUID
    version_id: uuid.UUID
    facts_count: int
    facts: List[ExtractedFactCandidate]


class FactVerificationRequest(BaseModel):
    action: str = Field(..., description="ACCEPT, EDIT, or REJECT")
    edited_value: Optional[Dict[str, Any]] = None
    rejection_reason: Optional[str] = None


class FactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_version_id: uuid.UUID
    fact_key: str
    raw_value: str
    normalized_value: Dict[str, Any]
    data_type: str
    epistemic_tier: str
    confidence_score: float
    extraction_method: str
    verification_status: str
    evidence_span: Optional[Dict[str, Any]] = None
