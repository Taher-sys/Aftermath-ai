import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from aftermath.database import get_db
from aftermath.evidence.engine import (
    EvidenceAuditReport,
    EvidenceEngine,
    EvidenceItem,
    ProvenanceStep,
)

router = APIRouter(prefix="/evidence", tags=["Evidence & Audit"])


@router.get("", response_model=List[EvidenceItem])
async def list_evidence(
    workspace_id: uuid.UUID = Query(...),
    q: Optional[str] = Query(None, description="Search query by term or quote"),
    db: AsyncSession = Depends(get_db),
) -> List[EvidenceItem]:
    """Lists all grounded evidence items and provenance records for the active workspace."""
    return await EvidenceEngine.list_workspace_evidence(
        workspace_id=workspace_id, db=db, search_query=q
    )


@router.get("/trail/{conclusion_id}", response_model=List[ProvenanceStep])
async def get_provenance_trail(
    conclusion_id: str,
    db: AsyncSession = Depends(get_db),
) -> List[ProvenanceStep]:
    """Retrieves step-by-step resolution chain: Conclusion -> Why? -> Evidence -> Original Source -> Fact -> Rule."""
    return await EvidenceEngine.build_provenance_trail(conclusion_id=conclusion_id, db=db)


@router.get("/audit", response_model=EvidenceAuditReport)
async def audit_evidence(
    workspace_id: uuid.UUID = Query(...),
    db: AsyncSession = Depends(get_db),
) -> EvidenceAuditReport:
    """Performs cryptographic audit check for broken references, missing sources, or offset drift."""
    return await EvidenceEngine.audit_evidence_integrity(workspace_id=workspace_id, db=db)
