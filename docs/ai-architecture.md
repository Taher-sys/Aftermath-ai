# AFTERMATH — AI Architecture & Extraction Pipeline
**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Classification:** Core AI & Extraction Specification  

---

## 1. AI Philosophy: Extractor & Hypothesis Generator, Never Arbiter

In AFTERMATH, artificial intelligence is strictly confined to two bounded roles:
1. **High-Fidelity Document Extractor:** Converting unstructured visual/textual legal and financial syntax into strongly typed, normalized domain facts.
2. **Ambiguity & Hypothesis Explorer:** Identifying open legal interpretations, potential ambiguities, and candidate consequences.

**AI is strictly forbidden from:**
* Deciding what action a human should take.
* Outputting ungrounded summaries or conversational pleasantries.
* Presenting an interpretation as a verified fact.
* Generating opaque risk percentages (e.g., *"This contract has a 78% risk score"*).

---

## 2. Multi-Stage Ingestion & Extraction Pipeline

Every ingested document progresses through a deterministic 6-stage pipeline:

```
[Uploaded Document: PDF / DOCX / Image / TXT]
                    │
                    ▼
[Stage 1: Layout & Spatial Text Extraction]
  - Extract characters with (x0, y0, x1, y1) bounding boxes and page indices
  - Compute SHA-256 binary hash and store in immutable vault
                    │
                    ▼
[Stage 2: Structural Document Hierarchy Reconstruction]
  - Identify Article / Section / Subsection / Paragraph tree
  - Preserve clause numbering and cross-references (e.g., "Subject to Section 4.2")
                    │
                    ▼
[Stage 3: Constrained Structured Fact Extraction]
  - Schema-enforced LLM inference (JSON Schema / Pydantic models)
  - Extract: Parties, Dates, Amounts, Deadlines, Notice Windows, Obligations
                    │
                    ▼
[Stage 4: Deterministic Normalization Engine]
  - Convert dates to ISO 8601 UTC
  - Normalize amounts to ISO 4217 standard (`USD 2500.00`)
  - Normalize time intervals (e.g., "within thirty (30) days" -> `P30D`)
                    │
                    ▼
[Stage 5: Cryptographic Grounding & Anti-Hallucination Verification]
  - Verify that `verbatim_text` exists at `[char_start:char_end]` on `page_number`
  - REJECT any extracted fact that cannot be verified in the source text
                    │
                    ▼
[Stage 6: Human-in-the-Loop (HITL) Verification Gateway]
  - Present candidate facts in Document Inspector
  - User actions: ACCEPT, EDIT, REJECT
```

---

## 3. Strict Schema Enforcement (Pydantic Extraction Models)

Extraction is performed using constrained decoding against rigorous Pydantic v2 schemas. Below is the canonical extraction schema for contractual facts:

```python
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

class ExtractedModality(str, Enum):
    MANDATORY = "MANDATORY"
    PROHIBITED = "PROHIBITED"
    OPTIONAL = "OPTIONAL"

class ExtractedDutyBearer(str, Enum):
    SELF = "SELF"
    COUNTERPARTY = "COUNTERPARTY"
    MUTUAL = "MUTUAL"
    THIRD_PARTY = "THIRD_PARTY"

class SourceSpan(BaseModel):
    page_number: int = Field(..., ge=1, description="1-based page number")
    char_start: int = Field(..., ge=0, description="Character offset start in page text")
    char_end: int = Field(..., ge=0, description="Character offset end in page text")
    verbatim_text: str = Field(..., min_length=1, description="Exact substring from document")

class ExtractedObligationCandidate(BaseModel):
    duty_bearer: ExtractedDutyBearer
    modality: ExtractedModality
    summary: str = Field(..., max_length=200)
    trigger_condition: Optional[str] = None
    penalty_on_breach: Optional[str] = None
    span: SourceSpan

class ExtractedFinancialTermCandidate(BaseModel):
    term_type: str = Field(..., description="e.g., RENT, DEPOSIT, LATE_FEE, BUYOUT")
    raw_amount: str = Field(..., description="Text as written, e.g., '$2,500.00 per month'")
    normalized_amount: float = Field(..., ge=0.0)
    currency: str = Field(..., min_length=3, max_length=3)
    frequency: str = Field(..., description="MONTHLY, ONE_TIME, ANNUAL, etc.")
    span: SourceSpan

class ExtractedDeadlinesCandidate(BaseModel):
    title: str = Field(..., max_length=100)
    deadline_type: str = Field(..., description="ABSOLUTE_DATE, RELATIVE_DAYS, NOTICE_WINDOW")
    raw_text: str
    target_date_iso: Optional[str] = None
    relative_offset_days: Optional[int] = None
    relative_to_event: Optional[str] = None
    span: SourceSpan

class ContractExtractionPayload(BaseModel):
    document_title: str
    governing_jurisdiction: Optional[str] = None
    counterparty_name: str
    effective_date_iso: Optional[str] = None
    expiration_date_iso: Optional[str] = None
    obligations: List[ExtractedObligationCandidate]
    financial_terms: List[ExtractedFinancialTermCandidate]
    deadlines: List[ExtractedDeadlinesCandidate]
```

---

## 4. Cryptographic Grounding & Anti-Hallucination Protocol

To eliminate LLM hallucinations, AFTERMATH implements an active **Grounding Verification Gate** before any extracted fact enters the database:

### The Verification Algorithm
1. The parser receives the proposed `SourceSpan`:
   * `page_number`
   * `char_start`, `char_end`
   * `verbatim_text`
2. The verification engine fetches the immutable extracted page text for that `page_number`:
   $$\text{Slice} = \text{PageText}[\text{char\_start}:\text{char\_end}]$$
3. **Exact Match Check:**
   $$\text{Slice} == \text{verbatim\_text}$$
4. **Fuzzy Fallback (Whitespace & Hyphenation tolerance):**
   If exact match fails (due to PDF line wraps or hyphenation), compute Levenshtein Similarity:
   $$\text{Similarity}(\text{Slice}, \text{verbatim\_text}) \ge 0.95$$
5. **Enforcement:** If both checks fail, the extracted candidate is **quarantined as an unverified hallucination** with status `REJECTED_UNGROUNDED` and is never linked into the commitment graph.

---

## 5. Model Provider Abstraction Architecture

AFTERMATH decouples all AI operations behind a clean, provider-agnostic interface:

```python
from abc import ABC, abstractmethod
from typing import Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class ModelAdapter(ABC):
    """Abstract interface for all model providers."""

    @abstractmethod
    async def extract_structured(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Type[T],
        temperature: float = 0.0
    ) -> T:
        """Enforces schema-constrained decoding with zero temperature."""
        pass

    @abstractmethod
    async def generate_explanation(
        self,
        causal_graph_context: str,
        user_query: str
    ) -> str:
        """Generates evidence-backed natural language explanations."""
        pass
```

### Supported Concrete Adapters
* **`LocalONNXAdapter` / `OllamaAdapter`:** Complete offline privacy. Runs quantized open-source models (e.g., Llama 3 / Mistral) locally on the user's hardware.
* **`GoogleGeminiAdapter`:** Uses Google Gemini 1.5/2.0 Flash / Pro with native `response_schema` JSON output mode for ultra-high throughput document extraction.
* **`AnthropicAdapter`:** Uses Claude 3.5 Sonnet with tool-use schema constraints for nuanced legal reasoning and ambiguity identification.
* **`OpenAIAdapter`:** Uses GPT-4o / GPT-4o-mini with Structured Outputs (`strict=True`).

---

## 6. Human-in-the-Loop (HITL) Verification Workflow

AI suggestions are never promoted directly to active commitments without the user having an opportunity to inspect and verify them.

1. **Extraction Queue:** Facts are saved with `verification_status = UNVERIFIED`.
2. **Visual Inspection:** In the `/documents/[id]` Document Inspector, the user sees each fact side-by-side with its highlighted bounding box on the source document page.
3. **User Action:**
   * **Accept:** Promotes fact to `VERIFIED`; triggers commitment and obligation synthesis.
   * **Edit:** User modifies the normalized value (e.g., corrects a parsed rent amount from $2,500 to $2,400); marked as `EDITED` with an immutable audit log of the edit.
   * **Reject:** Marked as `REJECTED`; excluded from all simulation runs and graph calculations.
