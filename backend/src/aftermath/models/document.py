import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import JSON, BigInteger, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from aftermath.models.base import GUID, Base, TimestampMixin

if TYPE_CHECKING:
    from aftermath.models.workspace import Workspace


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    domain_category: Mapped[str] = mapped_column(String(50), default="OTHER", nullable=False)

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="documents")
    versions: Mapped[List["DocumentVersion"]] = relationship(
        "DocumentVersion", back_populates="document", lazy="selectin", cascade="all, delete-orphan"
    )


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    processing_status: Mapped[str] = mapped_column(
        String(30), default="UPLOADED", nullable=False, index=True
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    page_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    document: Mapped["Document"] = relationship("Document", back_populates="versions")
    extracted_facts: Mapped[List["ExtractedFact"]] = relationship(
        "ExtractedFact",
        back_populates="document_version",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    evidence_records: Mapped[List["EvidenceRecord"]] = relationship(
        "EvidenceRecord",
        back_populates="document_version",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class ExtractedFact(Base):
    __tablename__ = "extracted_facts"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    document_version_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("document_versions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    fact_key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    raw_value: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_value: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    data_type: Mapped[str] = mapped_column(String(50), nullable=False)
    epistemic_tier: Mapped[str] = mapped_column(
        String(50), default="EXTRACTED_FACT", nullable=False
    )
    confidence_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    extraction_method: Mapped[str] = mapped_column(String(50), default="MANUAL", nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(30), default="UNVERIFIED", nullable=False, index=True
    )
    verified_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    document_version: Mapped["DocumentVersion"] = relationship(
        "DocumentVersion", back_populates="extracted_facts"
    )
    evidence_records: Mapped[List["EvidenceRecord"]] = relationship(
        "EvidenceRecord",
        back_populates="extracted_fact",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class EvidenceRecord(Base):
    __tablename__ = "evidence_records"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    extracted_fact_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("extracted_facts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_version_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("document_versions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    char_start: Mapped[int] = mapped_column(Integer, nullable=False)
    char_end: Mapped[int] = mapped_column(Integer, nullable=False)
    bounding_box: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    verbatim_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    extracted_fact: Mapped["ExtractedFact"] = relationship(
        "ExtractedFact", back_populates="evidence_records"
    )
    document_version: Mapped["DocumentVersion"] = relationship(
        "DocumentVersion", back_populates="evidence_records"
    )
