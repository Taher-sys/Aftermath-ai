import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from aftermath.models.document import ExtractedFact


class HITLService:
    """Manages the Human-in-the-Loop verification lifecycle for extracted contractual facts."""

    @classmethod
    async def verify_fact(
        cls,
        fact_id: uuid.UUID,
        action: str,
        db: AsyncSession,
        user_id: Optional[uuid.UUID] = None,
        edited_value: Optional[Dict[str, Any]] = None,
    ) -> ExtractedFact:
        """Executes human review transition: ACCEPT, EDIT, or REJECT."""
        action_upper = action.strip().upper()
        if action_upper not in ("ACCEPT", "EDIT", "REJECT"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid verification action '{action}'. Must be ACCEPT, EDIT, or REJECT.",
            )

        query = select(ExtractedFact).where(ExtractedFact.id == fact_id)
        result = await db.execute(query)
        fact = result.scalar_one_or_none()
        if not fact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Extracted fact '{fact_id}' not found.",
            )

        fact.verified_at = datetime.now(timezone.utc)
        fact.verified_by_user_id = user_id

        if action_upper == "ACCEPT":
            fact.verification_status = "VERIFIED"
        elif action_upper == "EDIT":
            if not edited_value:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Action EDIT requires 'edited_value' payload.",
                )
            fact.normalized_value = edited_value
            fact.verification_status = "EDITED"
        elif action_upper == "REJECT":
            fact.verification_status = "REJECTED"

        await db.commit()
        await db.refresh(fact)
        return fact
