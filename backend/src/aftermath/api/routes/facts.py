import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from aftermath.database import get_db
from aftermath.extraction.extractor import ContractExtractor
from aftermath.extraction.hitl import HITLService
from aftermath.extraction.schemas import (
    ExtractionResult,
    FactResponse,
    FactVerificationRequest,
)
from aftermath.ingestion.parser import DocumentParser
from aftermath.ingestion.storage import StorageVault
from aftermath.models.document import DocumentVersion, EvidenceRecord, ExtractedFact

router = APIRouter(tags=["Facts & Extraction"])
vault = StorageVault()


@router.post(
    "/documents/{document_id}/versions/{version_id}/extract",
    response_model=ExtractionResult,
    status_code=status.HTTP_200_OK,
)
async def extract_document_facts(
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ExtractionResult:
    """Extracts structured facts with exact character spans from an ingested document version."""
    ver_res = await db.execute(
        select(DocumentVersion).where(
            DocumentVersion.id == version_id, DocumentVersion.document_id == document_id
        )
    )
    version = ver_res.scalar_one_or_none()
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document version not found."
        )

    # Read binary and parse
    try:
        content_bytes = vault.read_document_blob(version.storage_path)
        parsed = DocumentParser.parse(content_bytes, version.mime_type)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to read or parse document: {str(e)}",
        )

    # Run Structured Extractor
    candidates = ContractExtractor.extract_from_parsed(parsed)

    # Persist facts and evidence
    for c in candidates:
        fact = ExtractedFact(
            document_version_id=version.id,
            fact_key=c.fact_key,
            raw_value=c.raw_value,
            normalized_value=c.normalized_value,
            data_type=c.data_type,
            epistemic_tier=c.epistemic_tier,
            confidence_score=c.confidence_score,
            extraction_method=c.extraction_method,
            verification_status="UNVERIFIED",
        )
        db.add(fact)
        await db.flush()

        evidence = EvidenceRecord(
            extracted_fact_id=fact.id,
            document_version_id=version.id,
            page_number=c.span.page_number,
            char_start=c.span.char_start,
            char_end=c.span.char_end,
            verbatim_text=c.span.verbatim_text,
        )
        db.add(evidence)

    await db.commit()

    return ExtractionResult(
        document_id=document_id,
        version_id=version_id,
        facts_count=len(candidates),
        facts=candidates,
    )


@router.get("/documents/{document_id}/facts", response_model=List[FactResponse])
async def list_document_facts(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> List[FactResponse]:
    """Retrieves all extracted facts and evidence records for a document."""
    query = (
        select(ExtractedFact)
        .join(DocumentVersion, DocumentVersion.id == ExtractedFact.document_version_id)
        .where(DocumentVersion.document_id == document_id)
        .order_by(ExtractedFact.created_at.asc())
    )
    result = await db.execute(query)
    facts = list(result.scalars().all())

    responses: List[FactResponse] = []
    for f in facts:
        evidence = None
        if f.evidence_records:
            ev = f.evidence_records[0]
            evidence = {
                "page_number": ev.page_number,
                "char_start": ev.char_start,
                "char_end": ev.char_end,
                "verbatim_text": ev.verbatim_text,
            }
        responses.append(
            FactResponse(
                id=f.id,
                document_version_id=f.document_version_id,
                fact_key=f.fact_key,
                raw_value=f.raw_value,
                normalized_value=f.normalized_value,
                data_type=f.data_type,
                epistemic_tier=f.epistemic_tier,
                confidence_score=f.confidence_score,
                extraction_method=f.extraction_method,
                verification_status=f.verification_status,
                evidence_span=evidence,
            )
        )
    return responses


@router.post("/facts/{fact_id}/verify", response_model=FactResponse)
async def verify_fact(
    fact_id: uuid.UUID,
    payload: FactVerificationRequest,
    db: AsyncSession = Depends(get_db),
) -> FactResponse:
    """Human-in-the-Loop verification action: ACCEPT, EDIT, or REJECT a fact."""
    fact = await HITLService.verify_fact(
        fact_id=fact_id,
        action=payload.action,
        db=db,
        edited_value=payload.edited_value,
    )

    evidence = None
    if fact.evidence_records:
        ev = fact.evidence_records[0]
        evidence = {
            "page_number": ev.page_number,
            "char_start": ev.char_start,
            "char_end": ev.char_end,
            "verbatim_text": ev.verbatim_text,
        }

    return FactResponse(
        id=fact.id,
        document_version_id=fact.document_version_id,
        fact_key=fact.fact_key,
        raw_value=fact.raw_value,
        normalized_value=fact.normalized_value,
        data_type=fact.data_type,
        epistemic_tier=fact.epistemic_tier,
        confidence_score=fact.confidence_score,
        extraction_method=fact.extraction_method,
        verification_status=fact.verification_status,
        evidence_span=evidence,
    )
