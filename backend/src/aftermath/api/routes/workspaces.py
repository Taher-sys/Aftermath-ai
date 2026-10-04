import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from aftermath.database import get_db
from aftermath.models.workspace import PrivacySetting, User, Workspace

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    owner_email: str = Field(default="user@example.com")
    owner_name: str = Field(default="Default User")


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    owner_user_id: uuid.UUID
    created_at: datetime


@router.get("", response_model=List[WorkspaceResponse])
async def list_workspaces(db: AsyncSession = Depends(get_db)) -> List[Workspace]:
    """Retrieve all active workspaces."""
    result = await db.execute(select(Workspace).order_by(Workspace.created_at.desc()))
    return list(result.scalars().all())


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    payload: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
) -> Workspace:
    """Create a new workspace and seed owner/privacy settings."""
    # Check if slug exists
    existing = await db.execute(select(Workspace).where(Workspace.slug == payload.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Workspace slug '{payload.slug}' already exists.",
        )

    # Get or create user
    user_res = await db.execute(select(User).where(User.email == payload.owner_email))
    user = user_res.scalar_one_or_none()
    if not user:
        user = User(email=payload.owner_email, full_name=payload.owner_name)
        db.add(user)
        await db.flush()

    workspace = Workspace(
        name=payload.name,
        slug=payload.slug,
        owner_user_id=user.id,
    )
    db.add(workspace)
    await db.flush()

    privacy = PrivacySetting(
        workspace_id=workspace.id,
        local_processing_only=False,
        mask_pii_before_llm=True,
    )
    db.add(privacy)
    await db.commit()
    await db.refresh(workspace)
    return workspace


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace_by_id(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Workspace:
    """Retrieve a single workspace by ID."""
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace '{workspace_id}' not found.",
        )
    return workspace
