import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, List

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from aftermath.models.base import GUID, Base, TimestampMixin

if TYPE_CHECKING:
    from aftermath.models.workspace import Workspace


class Scenario(Base, TimestampMixin):
    __tablename__ = "scenarios"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    variables: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="scenarios")
    simulation_runs: Mapped[List["SimulationRun"]] = relationship(
        "SimulationRun", back_populates="scenario", cascade="all, delete-orphan"
    )


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    scenario_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    executed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    execution_duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    engine_version: Mapped[str] = mapped_column(String(50), default="0.1.0", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="COMPLETED", nullable=False)
    outcomes_json: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    explanation_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    scenario: Mapped["Scenario"] = relationship("Scenario", back_populates="simulation_runs")
