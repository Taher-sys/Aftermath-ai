import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from aftermath.models.base import GUID, Base


class AIModel(Base):
    __tablename__ = "ai_models"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    parameters_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    prompt_template_version: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    evaluation_runs: Mapped[list["EvaluationRun"]] = relationship(
        "EvaluationRun", back_populates="model", cascade="all, delete-orphan"
    )


class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    model_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("ai_models.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    dataset_name: Mapped[str] = mapped_column(String(100), nullable=False)
    total_samples: Mapped[int] = mapped_column(Integer, nullable=False)
    exact_match_score: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    precision_score: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    recall_score: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    hallucination_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    metrics_breakdown: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    run_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    model: Mapped["AIModel"] = relationship("AIModel", back_populates="evaluation_runs")
