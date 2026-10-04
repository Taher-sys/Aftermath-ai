import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from aftermath.models.base import GUID, Base, TimestampMixin

if TYPE_CHECKING:
    from aftermath.models.commitment import Commitment
    from aftermath.models.document import Document
    from aftermath.models.simulation import Scenario


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    locale: Mapped[str] = mapped_column(String(10), default="en-US", nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)

    workspaces: Mapped[List["Workspace"]] = relationship(
        "Workspace", back_populates="owner", cascade="all, delete-orphan"
    )


class Workspace(Base, TimestampMixin):
    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)

    owner: Mapped["User"] = relationship("User", back_populates="workspaces")
    privacy_setting: Mapped[Optional["PrivacySetting"]] = relationship(
        "PrivacySetting", back_populates="workspace", uselist=False, cascade="all, delete-orphan"
    )
    documents: Mapped[List["Document"]] = relationship(
        "Document", back_populates="workspace", cascade="all, delete-orphan"
    )
    commitments: Mapped[List["Commitment"]] = relationship(
        "Commitment", back_populates="workspace", cascade="all, delete-orphan"
    )
    scenarios: Mapped[List["Scenario"]] = relationship(
        "Scenario", back_populates="workspace", cascade="all, delete-orphan"
    )


class PrivacySetting(Base, TimestampMixin):
    __tablename__ = "privacy_settings"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("workspaces.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    local_processing_only: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    mask_pii_before_llm: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    retention_days: Mapped[int] = mapped_column(Integer, default=365, nullable=False)
    allow_telemetry: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="privacy_setting")
