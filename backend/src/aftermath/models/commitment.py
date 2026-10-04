import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import JSON, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from aftermath.models.base import GUID, Base, TimestampMixin

if TYPE_CHECKING:
    from aftermath.models.workspace import Workspace


class Commitment(Base, TimestampMixin):
    __tablename__ = "commitments"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    origin_document_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("document_versions.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    counterparty_name: Mapped[str] = mapped_column(String(255), nullable=False)
    effective_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    expiration_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False, index=True)
    governing_jurisdiction: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="commitments")
    obligations: Mapped[List["Obligation"]] = relationship(
        "Obligation", back_populates="commitment", cascade="all, delete-orphan"
    )
    conditions: Mapped[List["Condition"]] = relationship(
        "Condition", back_populates="commitment", cascade="all, delete-orphan"
    )
    deadlines: Mapped[List["Deadline"]] = relationship(
        "Deadline", back_populates="commitment", cascade="all, delete-orphan"
    )
    financial_terms: Mapped[List["FinancialTerm"]] = relationship(
        "FinancialTerm", back_populates="commitment", cascade="all, delete-orphan"
    )


class Obligation(Base):
    __tablename__ = "obligations"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    commitment_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("commitments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    duty_bearer: Mapped[str] = mapped_column(String(30), default="SELF", nullable=False)
    modality: Mapped[str] = mapped_column(String(30), default="MANDATORY", nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    trigger_event: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    remedy_on_breach: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    commitment: Mapped["Commitment"] = relationship("Commitment", back_populates="obligations")
    deadlines: Mapped[List["Deadline"]] = relationship(
        "Deadline", back_populates="obligation", cascade="all, delete-orphan"
    )
    financial_terms: Mapped[List["FinancialTerm"]] = relationship(
        "FinancialTerm", back_populates="obligation", cascade="all, delete-orphan"
    )


class Condition(Base):
    __tablename__ = "conditions"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    commitment_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("commitments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    expression_logic: Mapped[str] = mapped_column(Text, nullable=False)
    is_satisfied: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    evaluation_type: Mapped[str] = mapped_column(
        String(50), default="DETERMINISTIC_DATE", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    commitment: Mapped["Commitment"] = relationship("Commitment", back_populates="conditions")


class Deadline(Base):
    __tablename__ = "deadlines"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    commitment_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("commitments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    obligation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("obligations.id", ondelete="CASCADE"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    deadline_type: Mapped[str] = mapped_column(String(50), default="ABSOLUTE_DATE", nullable=False)
    target_timestamp: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    relative_offset_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    relative_to_event: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    criticality: Mapped[str] = mapped_column(String(20), default="MEDIUM", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    commitment: Mapped["Commitment"] = relationship("Commitment", back_populates="deadlines")
    obligation: Mapped[Optional["Obligation"]] = relationship(
        "Obligation", back_populates="deadlines"
    )


class FinancialTerm(Base):
    __tablename__ = "financial_terms"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    commitment_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("commitments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    obligation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("obligations.id", ondelete="CASCADE"), nullable=True
    )
    term_type: Mapped[str] = mapped_column(String(50), default="ONE_TIME", nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    frequency: Mapped[str] = mapped_column(String(30), default="ONE_TIME", nullable=False)
    escalation_rate_pct: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2), default=Decimal("0.00"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    commitment: Mapped["Commitment"] = relationship("Commitment", back_populates="financial_terms")
    obligation: Mapped[Optional["Obligation"]] = relationship(
        "Obligation", back_populates="financial_terms"
    )


class Dependency(Base):
    __tablename__ = "dependencies"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_entity_id: Mapped[uuid.UUID] = mapped_column(GUID(), nullable=False, index=True)
    target_entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_entity_id: Mapped[uuid.UUID] = mapped_column(GUID(), nullable=False, index=True)
    dependency_type: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class Conflict(Base):
    __tablename__ = "conflicts"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    commitment_a_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("commitments.id", ondelete="CASCADE"), nullable=False
    )
    commitment_b_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("commitments.id", ondelete="CASCADE"), nullable=False
    )
    conflict_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="WARNING", nullable=False)
    resolution_status: Mapped[str] = mapped_column(String(20), default="OPEN", nullable=False)
    explanation_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
