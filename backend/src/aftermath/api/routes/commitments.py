import uuid
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from aftermath.api.deps import get_current_workspace_id
from aftermath.commitments.engine import (
    CommitmentEngine,
    CommitmentMapResponse,
    UnifiedTimelineResponse,
)
from aftermath.database import get_db
from aftermath.models.commitment import Commitment

router = APIRouter(prefix="/commitments", tags=["Commitments"])


class CommitmentCreate(BaseModel):
    workspace_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=255)
    counterparty_name: str = Field(..., min_length=1, max_length=255)
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    governing_jurisdiction: Optional[str] = None


class CommitmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    title: str
    counterparty_name: str
    status: str
    effective_date: Optional[date]
    expiration_date: Optional[date]
    governing_jurisdiction: Optional[str]
    created_at: datetime


@router.get("", response_model=List[CommitmentResponse])
async def list_commitments(
    workspace_id: Optional[uuid.UUID] = Depends(get_current_workspace_id),
    db: AsyncSession = Depends(get_db),
) -> List[Commitment]:
    """List commitments for the active workspace."""
    query = select(Commitment)
    if workspace_id:
        query = query.where(Commitment.workspace_id == workspace_id)
    query = query.order_by(Commitment.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/map", response_model=CommitmentMapResponse)
async def get_commitment_map(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> CommitmentMapResponse:
    """Returns the attributed human commitment graph with nodes and typed relationship edges."""
    return await CommitmentEngine.build_commitment_map(workspace_id=workspace_id, db=db)


@router.get("/timeline", response_model=UnifiedTimelineResponse)
async def get_unified_timeline(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> UnifiedTimelineResponse:
    """Returns the ordered chronological timeline of events, recurrence series, and overlapping periods."""
    return await CommitmentEngine.build_unified_timeline(workspace_id=workspace_id, db=db)


@router.post(
    "/synthesize/{document_id}",
    response_model=CommitmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def synthesize_document_commitments(
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Commitment:
    """Synthesizes structured human commitments, obligations, deadlines, and financial terms from verified facts."""
    return await CommitmentEngine.synthesize_from_facts(
        document_id=document_id,
        version_id=version_id,
        workspace_id=workspace_id,
        db=db,
    )


@router.post("", response_model=CommitmentResponse, status_code=status.HTTP_201_CREATED)
async def create_commitment(
    payload: CommitmentCreate,
    db: AsyncSession = Depends(get_db),
) -> Commitment:
    """Create a manual commitment record."""
    commitment = Commitment(
        workspace_id=payload.workspace_id,
        title=payload.title,
        counterparty_name=payload.counterparty_name,
        effective_date=payload.effective_date,
        expiration_date=payload.expiration_date,
        governing_jurisdiction=payload.governing_jurisdiction,
        status="ACTIVE",
    )
    db.add(commitment)
    await db.commit()
    await db.refresh(commitment)
    return commitment
