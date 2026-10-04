import io

import pytest
from PIL import Image

from aftermath.extraction.extractor import ContractExtractor
from aftermath.ingestion.multimodal import (
    LayoutElementType,
    MultimodalLayoutParser,
)


def test_markdown_and_ascii_table_layout_parsing():
    """Verifies that markdown and ASCII tables are parsed into structured 2D cell matrices."""
    sample_text = """
# SECTION 3: FINANCIAL TERMS

| Covenant Term | Amount Due | Frequency |
| Base Monthly Rent | $2,400.00 USD | Monthly |
| Security Deposit | $2,400.00 USD | One-time |

The tenant shall pay rent on the 1st of each month.
"""
    elements = MultimodalLayoutParser.parse_text_layout(sample_text)
    assert len(elements) >= 3

    # Check Heading
    headings = [e for e in elements if e.element_type == LayoutElementType.HEADING]
    assert len(headings) >= 1
    assert "SECTION 3" in headings[0].text

    # Check Table
    tables = [e for e in elements if e.element_type == LayoutElementType.TABLE]
    assert len(tables) == 1
    table_block = tables[0].table_data
    assert table_block is not None
    assert table_block.headers == ["Covenant Term", "Amount Due", "Frequency"]
    assert len(table_block.rows) == 2
    assert table_block.rows[0] == ["Base Monthly Rent", "$2,400.00 USD", "Monthly"]
    assert table_block.rows[1] == ["Security Deposit", "$2,400.00 USD", "One-time"]


def test_form_key_value_layout_parsing():
    """Verifies that key-value forms are recognized and parsed with clean field descriptors."""
    form_text = """
LANDLORD: Oakwood Properties LLC
TENANT: Jane Doe
START_DATE: November 1, 2026
END_DATE: October 31, 2027
PREMISES: 742 Evergreen Terrace, Springfield, IL
"""
    elements = MultimodalLayoutParser.parse_text_layout(form_text)
    form_elements = [e for e in elements if e.element_type == LayoutElementType.FORM_KEY_VALUE]
    assert len(form_elements) == 5

    landlord_elem = next(e for e in form_elements if e.form_data and e.form_data.key == "LANDLORD")
    assert landlord_elem.form_data.value == "Oakwood Properties LLC"

    start_elem = next(e for e in form_elements if e.form_data and e.form_data.key == "START_DATE")
    assert start_elem.form_data.value == "November 1, 2026"


def test_image_scan_ocr_layout_pipeline():
    """Verifies that scanned document images are processed into OCR layout elements with bounding boxes."""
    # Create synthetic test image
    img = Image.new("RGB", (800, 1100), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    doc = MultimodalLayoutParser.parse_image_ocr(img_bytes, mime_type="image/png")
    assert doc.mime_type == "image/png"
    assert doc.metadata["width"] == 800
    assert doc.metadata["height"] == 1100
    assert len(doc.layout_elements) >= 3

    # Check bounding boxes exist
    for elem in doc.layout_elements:
        assert elem.bbox is not None
        assert len(elem.bbox) == 4
        assert 0.0 <= elem.bbox[0] <= 1.0  # normalized x
        assert 0.0 <= elem.bbox[1] <= 1.0  # normalized y

    # Extract facts from layout
    candidates = ContractExtractor.extract_from_layout(doc)
    assert len(candidates) >= 2
    keys = {c.fact_key for c in candidates}
    assert "BASE_RENT" in keys
    assert "SECURITY_DEPOSIT" in keys


def test_safe_web_content_ingestion_and_ssrf_blocking():
    """Verifies that web content URL ingestion enforces SSRF barriers and parses clean semantic layout."""
    # SSRF Attack: Loopback / Private IP should be blocked immediately
    with pytest.raises(ValueError, match="Security Violation"):
        MultimodalLayoutParser.parse_web_content(
            "http://127.0.0.1:8000/secret.html", "<div>Secret</div>"
        )

    with pytest.raises(ValueError, match="Security Violation"):
        MultimodalLayoutParser.parse_web_content(
            "http://169.254.169.254/metadata", "<div>Cloud Metadata</div>"
        )

    with pytest.raises(ValueError, match="Disallowed web protocol scheme"):
        MultimodalLayoutParser.parse_web_content("ftp://example.com/doc.txt", "text")

    # Valid Public Domain Ingestion
    valid_html = """
    <html>
      <body>
        <h1>Employment Offer Letter</h1>
        <p>Employer: Antigravity Systems Inc.</p>
        <p>Notice Period: sixty (60) days prior written notice</p>
      </body>
    </html>
    """
    web_doc = MultimodalLayoutParser.parse_web_content("https://example.com/offer.html", valid_html)
    assert web_doc.mime_type == "text/html"
    assert len(web_doc.layout_elements) >= 2
    assert "Employment Offer Letter" in web_doc.extracted_text


def test_multimodal_evaluation_benchmark_metrics():
    """
    Measures actual Precision, Recall, Field Accuracy, and Source-Link Accuracy
    against a golden synthetic multimodal test set.
    """
    golden_test_cases = [
        {
            "raw": "| Base Rent | $2,400.00 USD | Monthly |\n| Security Deposit | $2,400.00 USD | One-time |",
            "expected_facts": [
                {"key": "BASE_RENT", "norm_val": 2400.0, "verbatim": "Base Rent: $2,400.00 USD"},
                {
                    "key": "SECURITY_DEPOSIT",
                    "norm_val": 2400.0,
                    "verbatim": "Security Deposit: $2,400.00 USD",
                },
            ],
        },
        {
            "raw": "Landlord: Oakwood Properties LLC\nCommencement: November 1, 2026",
            "expected_facts": [
                {
                    "key": "COUNTERPARTY_NAME",
                    "norm_val": "Oakwood Properties LLC",
                    "verbatim": "Landlord: Oakwood Properties LLC",
                },
                {
                    "key": "EFFECTIVE_DATE",
                    "norm_val": "2026-11-01",
                    "verbatim": "Commencement: November 1, 2026",
                },
            ],
        },
    ]

    total_expected = 0
    total_extracted = 0
    true_positives = 0
    field_accuracy_matches = 0
    source_link_accuracy_matches = 0

    for case in golden_test_cases:
        elements = MultimodalLayoutParser.parse_text_layout(case["raw"])
        from aftermath.ingestion.multimodal import MultimodalDocument

        doc = MultimodalDocument(
            mime_type="text/plain",
            page_count=1,
            layout_elements=elements,
            extracted_text=case["raw"],
        )
        extracted = ContractExtractor.extract_from_layout(doc)
        total_extracted += len(extracted)
        total_expected += len(case["expected_facts"])

        for exp in case["expected_facts"]:
            match = next((f for f in extracted if f.fact_key == exp["key"]), None)
            if match:
                true_positives += 1
                # Check field accuracy
                if (
                    "amount" in match.normalized_value
                    and match.normalized_value["amount"] == exp["norm_val"]
                ):
                    field_accuracy_matches += 1
                elif (
                    "name" in match.normalized_value
                    and match.normalized_value["name"] == exp["norm_val"]
                ):
                    field_accuracy_matches += 1
                elif (
                    "date_iso" in match.normalized_value
                    and match.normalized_value["date_iso"] == exp["norm_val"]
                ):
                    field_accuracy_matches += 1

                # Check source-link accuracy: verbatim text matches ground-truth source
                if match.span.verbatim_text == exp["verbatim"]:
                    source_link_accuracy_matches += 1

    precision = true_positives / total_extracted if total_extracted > 0 else 0.0
    recall = true_positives / total_expected if total_expected > 0 else 0.0
    field_accuracy = field_accuracy_matches / true_positives if true_positives > 0 else 0.0
    source_link_accuracy = (
        source_link_accuracy_matches / true_positives if true_positives > 0 else 0.0
    )

    assert precision >= 0.95, f"Expected Precision >= 0.95, got {precision}"
    assert recall >= 0.95, f"Expected Recall >= 0.95, got {recall}"
    assert field_accuracy >= 0.95, f"Expected Field Accuracy >= 0.95, got {field_accuracy}"
    assert source_link_accuracy >= 0.95, (
        f"Expected Source-Link Accuracy >= 0.95, got {source_link_accuracy}"
    )
