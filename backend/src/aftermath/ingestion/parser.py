import io
from typing import Any, Dict, List

import docx
import pypdf
from PIL import Image
from pydantic import BaseModel


class DocumentPage(BaseModel):
    page_number: int
    text: str
    char_count: int


class ParsedDocument(BaseModel):
    full_text: str
    page_count: int
    pages: List[DocumentPage]
    metadata: Dict[str, Any]


class ParseError(Exception):
    """Raised when document parsing fails."""

    pass


class DocumentParser:
    """Extracts structured spatial and plain text from supported document formats."""

    @classmethod
    def parse(cls, content: bytes, mime_type: str) -> ParsedDocument:
        """Dispatches content to appropriate format parser."""
        if mime_type == "application/pdf":
            return cls._parse_pdf(content)
        elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return cls._parse_docx(content)
        elif mime_type == "text/plain":
            return cls._parse_txt(content)
        elif mime_type in ("image/png", "image/jpeg", "image/tiff"):
            return cls._parse_image(content, mime_type)
        else:
            raise ParseError(f"Unsupported MIME type for parsing: {mime_type}")

    @classmethod
    def _parse_pdf(cls, content: bytes) -> ParsedDocument:
        try:
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages: List[DocumentPage] = []
            full_text_parts: List[str] = []

            for idx, page in enumerate(reader.pages, start=1):
                page_text = page.extract_text() or ""
                pages.append(
                    DocumentPage(
                        page_number=idx,
                        text=page_text,
                        char_count=len(page_text),
                    )
                )
                full_text_parts.append(page_text)

            meta: Dict[str, Any] = {}
            if reader.metadata:
                for k, v in reader.metadata.items():
                    if isinstance(v, (str, int, float, bool)):
                        meta[str(k).lstrip("/")] = v

            return ParsedDocument(
                full_text="\n\n".join(full_text_parts),
                page_count=len(pages),
                pages=pages,
                metadata=meta,
            )
        except Exception as e:
            raise ParseError(f"Failed to parse PDF document: {str(e)}") from e

    @classmethod
    def _parse_docx(cls, content: bytes) -> ParsedDocument:
        try:
            doc = docx.Document(io.BytesIO(content))
            text_parts: List[str] = []

            for para in doc.paragraphs:
                if para.text.strip():
                    text_parts.append(para.text)

            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(
                        cell.text.strip() for cell in row.cells if cell.text.strip()
                    )
                    if row_text:
                        text_parts.append(row_text)

            full_text = "\n".join(text_parts)
            pages = [
                DocumentPage(
                    page_number=1,
                    text=full_text,
                    char_count=len(full_text),
                )
            ]
            return ParsedDocument(
                full_text=full_text,
                page_count=1,
                pages=pages,
                metadata={"paragraph_count": len(doc.paragraphs), "table_count": len(doc.tables)},
            )
        except Exception as e:
            raise ParseError(f"Failed to parse DOCX document: {str(e)}") from e

    @classmethod
    def _parse_txt(cls, content: bytes) -> ParsedDocument:
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1")

        pages = [
            DocumentPage(
                page_number=1,
                text=text,
                char_count=len(text),
            )
        ]
        return ParsedDocument(
            full_text=text,
            page_count=1,
            pages=pages,
            metadata={"encoding": "utf-8"},
        )

    @classmethod
    def _parse_image(cls, content: bytes, mime_type: str) -> ParsedDocument:
        try:
            img = Image.open(io.BytesIO(content))
            width, height = img.size
            format_name = img.format
            placeholder_text = f"[Image Document: {format_name} {width}x{height}]"
            pages = [
                DocumentPage(
                    page_number=1,
                    text=placeholder_text,
                    char_count=len(placeholder_text),
                )
            ]
            return ParsedDocument(
                full_text=placeholder_text,
                page_count=1,
                pages=pages,
                metadata={"width": width, "height": height, "format": format_name},
            )
        except Exception as e:
            raise ParseError(f"Failed to inspect image document: {str(e)}") from e
