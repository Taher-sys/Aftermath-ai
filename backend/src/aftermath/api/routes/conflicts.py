import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from aftermath.api.deps import get_current_workspace_id
from aftermath.conflicts.engine import (
    ConflictEvaluationResult,
    ConflictRuleEngine,
)
from aftermath.database import get_db
from aftermath.models.commitment import Conflict

router = APIRouter(prefix="/conflicts", tags=["Conflicts & Constraints"])


class ConflictResponse(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    conflict_type: str
    severity: str
    resolution_status: str
    explanation_json: dict


@router.get("", response_model=List[ConflictResponse])
async def list_conflicts(
    workspace_id: Optional[uuid.UUID] = Depends(get_current_workspace_id),
    db: AsyncSession = Depends(get_db),
) -> List[Conflict]:
    """Retrieves all open or resolved conflicts for the active workspace."""
    query = select(Conflict)
    if workspace_id:
        query = query.where(Conflict.workspace_id == workspace_id)
    query = query.order_by(Conflict.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("/evaluate", response_model=ConflictEvaluationResult)
async def evaluate_conflicts(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ConflictEvaluationResult:
    """Executes deterministic temporal, financial, and dependency rules across commitments."""
    return await ConflictRuleEngine.evaluate_workspace(workspace_id=workspace_id, db=db)


@router.post("/{conflict_id}/resolve", response_model=ConflictResponse)
async def resolve_conflict(
    conflict_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Conflict:
    """Marks a detected conflict as RESOLVED or ACKNOWLEDGED by the human user."""
    query = select(Conflict).where(Conflict.id == conflict_id)
    result = await db.execute(query)
    conflict = result.scalar_one_or_none()
    if not conflict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conflict '{conflict_id}' not found.",
        )

    conflict.resolution_status = "RESOLVED"
    await db.commit()
    await db.refresh(conflict)
    return conflict
