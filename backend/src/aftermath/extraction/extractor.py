import re
from typing import Any, List

from aftermath.extraction.grounding import GroundingGate
from aftermath.extraction.normalizer import FactNormalizer
from aftermath.extraction.schemas import ExtractedFactCandidate, RawSourceSpan
from aftermath.ingestion.parser import ParsedDocument


class ContractExtractor:
    """Extracts structured, grounded commitment facts from parsed documents."""

    @classmethod
    def extract_from_parsed(cls, parsed: ParsedDocument) -> List[ExtractedFactCandidate]:
        """Extracts all recognized contractual facts across all pages with physical grounding."""
        facts: List[ExtractedFactCandidate] = []

        for page in parsed.pages:
            page_text = page.text
            page_num = page.page_number
            if not page_text:
                continue

            # 1. Extract Base Rent / Recurring Payment
            rent_matches = re.finditer(
                r"(?:monthly\s+base\s+rent\s+of|monthly\s+rent\s+shall\s+be|rent:\s*)\s*(\$[0-9,]+(?:\.[0-9]{2})?\s*(?:USD)?(?:\s*per\s+month)?)",
                page_text,
                re.IGNORECASE,
            )
            for m in rent_matches:
                raw_val = m.group(1).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    norm = FactNormalizer.normalize_currency(raw_val, default_frequency="MONTHLY")
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="BASE_RENT",
                            raw_value=raw_val,
                            normalized_value=norm,
                            data_type="CURRENCY",
                            confidence_score=0.98,
                            extraction_method="REGEX_DETERMINISTIC",
                            span=span,
                        )
                    )

            # 2. Extract Security Deposit
            deposit_matches = re.finditer(
                r"(?:security\s+deposit|deposit\s+equal\s+to|deposit\s+shall\s+be|deposit\s+)\s*(\$[0-9,]+(?:\.[0-9]{2})?\s*(?:USD)?)",
                page_text,
                re.IGNORECASE,
            )
            for m in deposit_matches:
                raw_val = m.group(1).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    norm = FactNormalizer.normalize_currency(raw_val)
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="SECURITY_DEPOSIT",
                            raw_value=raw_val,
                            normalized_value=norm,
                            data_type="CURRENCY",
                            confidence_score=0.96,
                            extraction_method="REGEX_DETERMINISTIC",
                            span=span,
                        )
                    )

            # 3. Extract Notice Period
            notice_matches = re.finditer(
                r"(\b(?:at\s+least\s+)?(?:[a-z]+\s*\(\d+\)|\d+)\s*(?:calendar\s*)?days(?:\s*prior\s+written)?\s*notice\b)",
                page_text,
                re.IGNORECASE,
            )
            for m in notice_matches:
                raw_val = m.group(1).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    norm = FactNormalizer.normalize_duration(raw_val)
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="NOTICE_PERIOD",
                            raw_value=raw_val,
                            normalized_value=norm,
                            data_type="DURATION",
                            confidence_score=0.95,
                            extraction_method="REGEX_DETERMINISTIC",
                            span=span,
                        )
                    )

            # 4. Extract Early Termination / Buyout Fee
            buyout_matches = re.finditer(
                r"(?:early\s+termination\s+(?:buyout\s+)?fee\s+(?:is|equal\s+to|equivalent\s+to))\s*([^\n\.;]+(?:\$[0-9,]+(?:\.[0-9]{2})?)?[^\n\.;]*)",
                page_text,
                re.IGNORECASE,
            )
            for m in buyout_matches:
                raw_val = m.group(1).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    norm = FactNormalizer.normalize_currency(raw_val)
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="EARLY_TERMINATION_FEE",
                            raw_value=raw_val,
                            normalized_value=norm,
                            data_type="CURRENCY",
                            confidence_score=0.94,
                            extraction_method="REGEX_DETERMINISTIC",
                            span=span,
                        )
                    )

            # 5. Extract Late Fee & Grace Window
            late_matches = re.finditer(
                r"(late\s+(?:fee|charge)\s+of\s+(\$[0-9,]+(?:\.[0-9]{2})?)[^\n\.;]*)",
                page_text,
                re.IGNORECASE,
            )
            for m in late_matches:
                raw_val = m.group(1).strip()
                fee_val = m.group(2).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    norm = FactNormalizer.normalize_currency(fee_val)
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="LATE_FEE_PENALTY",
                            raw_value=raw_val,
                            normalized_value=norm,
                            data_type="CURRENCY",
                            confidence_score=0.97,
                            extraction_method="REGEX_DETERMINISTIC",
                            span=span,
                        )
                    )

            # 6. Extract Effective / Commencement Date
            commence_matches = re.finditer(
                r"(?:commencing\s+on|beginning\s+on|entered\s+into\s+on)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})",
                page_text,
                re.IGNORECASE,
            )
            for m in commence_matches:
                raw_val = m.group(1).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    norm_date = FactNormalizer.normalize_date(raw_val)
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="EFFECTIVE_DATE",
                            raw_value=raw_val,
                            normalized_value={"date_iso": norm_date, "raw": raw_val},
                            data_type="DATE",
                            confidence_score=0.99,
                            extraction_method="REGEX_DETERMINISTIC",
                            span=span,
                        )
                    )

            # 7. Extract Expiration / Termination Date
            exp_matches = re.finditer(
                r"(?:terminating\s+on|ending\s+on|prior\s+to)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})",
                page_text,
                re.IGNORECASE,
            )
            for m in exp_matches:
                raw_val = m.group(1).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    norm_date = FactNormalizer.normalize_date(raw_val)
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="EXPIRATION_DATE",
                            raw_value=raw_val,
                            normalized_value={"date_iso": norm_date, "raw": raw_val},
                            data_type="DATE",
                            confidence_score=0.99,
                            extraction_method="REGEX_DETERMINISTIC",
                            span=span,
                        )
                    )

            # 8. Extract Governing Jurisdiction
            law_matches = re.finditer(
                r"(?:laws\s+of\s+the\s+State\s+of|governed\s+by\s+the\s+laws\s+of)\s+([A-Za-z\s]+?)(?:\.|\n|$)",
                page_text,
                re.IGNORECASE,
            )
            for m in law_matches:
                raw_val = m.group(1).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="GOVERNING_LAW",
                            raw_value=raw_val,
                            normalized_value={"jurisdiction": raw_val},
                            data_type="TEXT",
                            confidence_score=0.98,
                            extraction_method="REGEX_DETERMINISTIC",
                            span=span,
                        )
                    )

            # 9. Extract Premises / Location
            loc_matches = re.finditer(
                r"(?:premises\s+located\s+at|premises:\s*)\s*([0-9]+[^\n\.;]+)",
                page_text,
                re.IGNORECASE,
            )
            for m in loc_matches:
                raw_val = m.group(1).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="PREMISES_LOCATION",
                            raw_value=raw_val,
                            normalized_value={"location": raw_val},
                            data_type="TEXT",
                            confidence_score=0.95,
                            extraction_method="REGEX_DETERMINISTIC",
                            span=span,
                        )
                    )

            # 10. Extract Repair Notice Duty (Mandatory Obligation)
            duty_matches = re.finditer(
                r"(Tenant\s+shall\s+notify\s+Landlord\s+in\s+writing\s+within\s+([^\n\.;]+)\s+of\s+[^\n\.;]+)",
                page_text,
                re.IGNORECASE,
            )
            for m in duty_matches:
                raw_val = m.group(1).strip()
                span = RawSourceSpan(
                    page_number=page_num,
                    char_start=m.start(1),
                    char_end=m.end(1),
                    verbatim_text=raw_val,
                )
                if GroundingGate.verify_span(page_text, span):
                    facts.append(
                        ExtractedFactCandidate(
                            fact_key="MAINTENANCE_NOTICE_DUTY",
                            raw_value=raw_val,
                            normalized_value={
                                "modality": "MANDATORY",
                                "duty_bearer": "SELF",
                                "summary": raw_val,
                            },
                            data_type="MODAL_DUTY",
                            confidence_score=0.96,
                            extraction_method="LAYOUT_CLAUSE_PARSER",
                            span=span,
                        )
                    )

        return facts

    @classmethod
    def extract_from_layout(cls, multimodal_doc: Any) -> List[ExtractedFactCandidate]:
        """Extracts structured candidate facts from structured multimodal layout elements (tables, forms, paragraphs)."""
        from aftermath.ingestion.multimodal import LayoutElementType

        candidates: List[ExtractedFactCandidate] = []

        for elem in multimodal_doc.layout_elements:
            # 1. Table-based extraction
            if elem.element_type == LayoutElementType.TABLE and elem.table_data:
                rows_to_check: List[List[str]] = []
                if elem.table_data.headers and any(
                    "$" in h or "rent" in h.lower() or "deposit" in h.lower() or "fee" in h.lower()
                    for h in elem.table_data.headers
                ):
                    rows_to_check.append(elem.table_data.headers)
                rows_to_check.extend(elem.table_data.rows)

                for row in rows_to_check:
                    if len(row) >= 2:
                        term_label = row[0].strip().lower()
                        term_val = row[1].strip()

                        if "rent" in term_label:
                            span = RawSourceSpan(
                                page_number=elem.page_number,
                                char_start=elem.char_start,
                                char_end=elem.char_end,
                                verbatim_text=f"{row[0]}: {term_val}",
                            )
                            norm = FactNormalizer.normalize_currency(
                                term_val, default_frequency="MONTHLY"
                            )
                            candidates.append(
                                ExtractedFactCandidate(
                                    fact_key="BASE_RENT",
                                    raw_value=term_val,
                                    normalized_value=norm,
                                    data_type="CURRENCY",
                                    confidence_score=0.98,
                                    extraction_method="MULTIMODAL_LAYOUT_TABLE",
                                    span=span,
                                )
                            )
                        elif "deposit" in term_label:
                            span = RawSourceSpan(
                                page_number=elem.page_number,
                                char_start=elem.char_start,
                                char_end=elem.char_end,
                                verbatim_text=f"{row[0]}: {term_val}",
                            )
                            norm = FactNormalizer.normalize_currency(
                                term_val, default_frequency="ONE_TIME"
                            )
                            candidates.append(
                                ExtractedFactCandidate(
                                    fact_key="SECURITY_DEPOSIT",
                                    raw_value=term_val,
                                    normalized_value=norm,
                                    data_type="CURRENCY",
                                    confidence_score=0.97,
                                    extraction_method="MULTIMODAL_LAYOUT_TABLE",
                                    span=span,
                                )
                            )

            # 2. Form Key-Value extraction
            elif elem.element_type == LayoutElementType.FORM_KEY_VALUE and elem.form_data:
                key_norm = elem.form_data.key.upper()
                val = elem.form_data.value.strip()
                span = RawSourceSpan(
                    page_number=elem.page_number,
                    char_start=elem.char_start,
                    char_end=elem.char_end,
                    verbatim_text=f"{elem.form_data.raw_key}: {val}",
                )

                if "LANDLORD" in key_norm or "COUNTERPARTY" in key_norm or "EMPLOYER" in key_norm:
                    candidates.append(
                        ExtractedFactCandidate(
                            fact_key="COUNTERPARTY_NAME",
                            raw_value=val,
                            normalized_value={"name": val},
                            data_type="TEXT",
                            confidence_score=0.97,
                            extraction_method="MULTIMODAL_OCR_FORM",
                            span=span,
                        )
                    )
                elif (
                    "START_DATE" in key_norm
                    or "COMMENCEMENT" in key_norm
                    or "EFFECTIVE" in key_norm
                ):
                    norm_date = FactNormalizer.normalize_date(val)
                    candidates.append(
                        ExtractedFactCandidate(
                            fact_key="EFFECTIVE_DATE",
                            raw_value=val,
                            normalized_value={"date_iso": norm_date, "raw": val},
                            data_type="DATE",
                            confidence_score=0.99,
                            extraction_method="MULTIMODAL_OCR_FORM",
                            span=span,
                        )
                    )

            # 3. Paragraph-based extraction
            elif elem.element_type == LayoutElementType.PARAGRAPH:
                p_text = elem.text
                if "notice" in p_text.lower():
                    m = re.search(
                        r"(\b(?:at\s+least\s+)?(?:[a-z]+\s*\(\d+\)|\d+)\s*(?:calendar\s*)?days(?:\s*prior\s+written)?\s*notice\b)",
                        p_text,
                        re.IGNORECASE,
                    )
                    if m:
                        raw_v = m.group(1).strip()
                        span = RawSourceSpan(
                            page_number=elem.page_number,
                            char_start=elem.char_start + m.start(1),
                            char_end=elem.char_start + m.end(1),
                            verbatim_text=raw_v,
                        )
                        norm_dur = FactNormalizer.normalize_duration(raw_v)
                        candidates.append(
                            ExtractedFactCandidate(
                                fact_key="NOTICE_PERIOD",
                                raw_value=raw_v,
                                normalized_value=norm_dur,
                                data_type="DURATION",
                                confidence_score=0.96,
                                extraction_method="MULTIMODAL_PARAGRAPH_PARSER",
                                span=span,
                            )
                        )

        return candidates
