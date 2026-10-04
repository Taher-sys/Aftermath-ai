import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from aftermath.api.deps import get_current_workspace_id
from aftermath.database import get_db
from aftermath.ingestion.parser import DocumentParser, ParseError
from aftermath.ingestion.storage import StorageVault
from aftermath.ingestion.validator import DocumentValidator, ValidationError
from aftermath.models.document import Document, DocumentVersion
from aftermath.models.workspace import Workspace

router = APIRouter(prefix="/documents", tags=["Documents"])
vault = StorageVault()


class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    domain_category: str = Field(default="OTHER")
    workspace_id: uuid.UUID


class DocumentVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    version_number: int
    file_name: str
    mime_type: str
    file_size_bytes: int
    sha256_hash: str
    processing_status: str
    error_message: Optional[str] = None
    page_count: Optional[int] = None
    created_at: datetime


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    title: str
    domain_category: str
    created_at: datetime
    versions: List[DocumentVersionResponse] = []


class ParsedPageContent(BaseModel):
    page_number: int
    text: str
    char_count: int


class DocumentContentResponse(BaseModel):
    document_id: uuid.UUID
    version_id: uuid.UUID
    title: str
    page_count: int
    full_text: str
    pages: List[ParsedPageContent]


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    workspace_id: Optional[uuid.UUID] = Depends(get_current_workspace_id),
    db: AsyncSession = Depends(get_db),
) -> List[Document]:
    """List documents for the active workspace."""
    query = select(Document)
    if workspace_id:
        query = query.where(Document.workspace_id == workspace_id)
    query = query.order_by(Document.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreate,
    db: AsyncSession = Depends(get_db),
) -> Document:
    """Create a new metadata-only document entry."""
    doc = Document(
        title=payload.title,
        domain_category=payload.domain_category,
        workspace_id=payload.workspace_id,
    )
    db.add(doc)
    await db.commit()
    doc_res = await db.execute(select(Document).where(Document.id == doc.id))
    return doc_res.scalar_one()


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    workspace_id: uuid.UUID = Form(...),
    title: Optional[str] = Form(None),
    domain_category: str = Form("OTHER"),
    db: AsyncSession = Depends(get_db),
) -> Document:
    """Securely uploads, validates, hashes, stores, and parses a document."""
    # 1. Verify workspace exists
    ws_res = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    if not ws_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace '{workspace_id}' does not exist.",
        )

    # 2. Read bytes into memory
    content = await file.read()
    filename = file.filename or "uploaded_document"
    declared_mime = file.content_type or "application/octet-stream"

    # 3. Validate file magic bytes and active content
    try:
        detected_mime, format_category = DocumentValidator.validate_file(
            content=content, filename=filename, declared_mime=declared_mime
        )
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # 4. Store blob in encrypted vault & get hash
    ext = filename.split(".")[-1] if "." in filename else ""
    storage_path, sha256_hash, file_size = vault.store_document_blob(content, ext)

    # 5. Check if duplicate document already exists in this workspace
    dup_query = (
        select(DocumentVersion)
        .join(Document, Document.id == DocumentVersion.document_id)
        .where(
            Document.workspace_id == workspace_id,
            DocumentVersion.sha256_hash == sha256_hash,
        )
    )
    existing_dup = (await db.execute(dup_query)).scalar_one_or_none()
    if existing_dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Document with identical SHA-256 hash '{sha256_hash}' already exists in this workspace.",
        )

    # 6. Create Document record
    doc_title = title.strip() if title and title.strip() else filename
    document = Document(
        workspace_id=workspace_id,
        title=doc_title,
        domain_category=domain_category,
    )
    db.add(document)
    await db.flush()

    # 7. Create DocumentVersion record (Initial Status: PROCESSING)
    doc_version = DocumentVersion(
        document_id=document.id,
        version_number=1,
        file_name=filename,
        mime_type=detected_mime,
        file_size_bytes=file_size,
        sha256_hash=sha256_hash,
        storage_path=storage_path,
        processing_status="PROCESSING",
    )
    db.add(doc_version)
    await db.flush()

    # 8. Execute Document Parser
    try:
        parsed = DocumentParser.parse(content, detected_mime)
        doc_version.page_count = parsed.page_count
        doc_version.source_metadata = {
            "parsed_metadata": parsed.metadata,
            "format_category": format_category,
        }
        doc_version.processing_status = "PROCESSED"
    except ParseError as pe:
        doc_version.processing_status = "FAILED"
        doc_version.error_message = str(pe)

    await db.commit()
    doc_res = await db.execute(select(Document).where(Document.id == document.id))
    return doc_res.scalar_one()


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Document:
    """Retrieve document metadata and all versions."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found.",
        )
    return doc


@router.get("/{document_id}/versions/{version_id}/content", response_model=DocumentContentResponse)
async def get_document_content(
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> DocumentContentResponse:
    """Retrieves the parsed textual content and page breakdown of a document version."""
    doc_res = await db.execute(select(Document).where(Document.id == document_id))
    doc = doc_res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    ver_res = await db.execute(
        select(DocumentVersion).where(
            DocumentVersion.id == version_id, DocumentVersion.document_id == document_id
        )
    )
    version = ver_res.scalar_one_or_none()
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document version not found."
        )

    # Read binary and parse
    try:
        content_bytes = vault.read_document_blob(version.storage_path)
        parsed = DocumentParser.parse(content_bytes, version.mime_type)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to read or parse document content: {str(e)}",
        )

    return DocumentContentResponse(
        document_id=doc.id,
        version_id=version.id,
        title=doc.title,
        page_count=parsed.page_count,
        full_text=parsed.full_text,
        pages=[
            ParsedPageContent(page_number=p.page_number, text=p.text, char_count=p.char_count)
            for p in parsed.pages
        ],
    )
