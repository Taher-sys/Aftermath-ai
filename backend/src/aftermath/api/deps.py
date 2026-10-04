import uuid
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from aftermath.database import get_db
from aftermath.models.workspace import Workspace


async def get_current_workspace_id(
    x_workspace_id: Optional[str] = Header(default=None, alias="X-Workspace-Id"),
) -> Optional[uuid.UUID]:
    """Extract and validate the workspace UUID from headers."""
    if not x_workspace_id:
        return None
    try:
        return uuid.UUID(x_workspace_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid X-Workspace-Id header format. Must be a valid UUID.",
        )


async def get_workspace(
    workspace_id: Optional[uuid.UUID] = Depends(get_current_workspace_id),
    db: AsyncSession = Depends(get_db),
) -> Optional[Workspace]:
    """Retrieve the workspace entity if workspace_id is provided."""
    if not workspace_id:
        return None
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace '{workspace_id}' not found.",
        )
    return workspace
