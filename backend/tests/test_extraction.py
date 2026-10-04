import pytest
from httpx import AsyncClient

from aftermath.extraction.extractor import ContractExtractor
from aftermath.extraction.grounding import GroundingGate, UngroundedSpanError
from aftermath.extraction.schemas import RawSourceSpan
from aftermath.ingestion.parser import DocumentPage, ParsedDocument

SAMPLE_CONTRACT_TEXT = """RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is entered into on November 1, 2026, by and between Oakwood Properties LLC ("Landlord")
and Alex Mercer ("Tenant").

1. PREMISES: Landlord hereby leases to Tenant the premises located at 742 Evergreen Terrace, Springfield, IL.
2. TERM: Commencing on November 1, 2026, and terminating on October 31, 2027.
3. RENT: Tenant agrees to pay Landlord monthly base rent of $2,400.00 USD, due on the first day of each month.
4. SECURITY DEPOSIT: Upon signing this Agreement, Tenant shall deposit $2,400.00 USD with Landlord.
5. EARLY TERMINATION & BUYOUT: Tenant may terminate this Agreement prior to October 31, 2027, provided Tenant:
   (a) gives at least sixty (60) days prior written notice, and
   (b) pays an early termination buyout fee equal to $2,400.00 USD.
6. LATE PAYMENTS: If rent is not received by the fifth day, Tenant shall pay a late fee of $100.00 USD.
7. REPAIRS & NOTICE: Tenant shall notify Landlord in writing within forty-eight (48) hours of any water leakage.
8. GOVERNING LAW: This Agreement shall be governed by the laws of the State of Illinois.
"""


def test_contract_extractor_deterministic_grounding():
    parsed = ParsedDocument(
        full_text=SAMPLE_CONTRACT_TEXT,
        page_count=1,
        pages=[
            DocumentPage(
                page_number=1, text=SAMPLE_CONTRACT_TEXT, char_count=len(SAMPLE_CONTRACT_TEXT)
            )
        ],
        metadata={},
    )

    facts = ContractExtractor.extract_from_parsed(parsed)
    assert len(facts) >= 8

    # Verify each fact's physical grounding
    fact_dict = {f.fact_key: f for f in facts}

    assert "BASE_RENT" in fact_dict
    assert fact_dict["BASE_RENT"].normalized_value["amount"] == 2400.00
    assert fact_dict["BASE_RENT"].normalized_value["frequency"] == "MONTHLY"

    assert "SECURITY_DEPOSIT" in fact_dict
    assert fact_dict["SECURITY_DEPOSIT"].normalized_value["amount"] == 2400.00

    assert "NOTICE_PERIOD" in fact_dict
    assert fact_dict["NOTICE_PERIOD"].normalized_value["duration_days"] == 60

    assert "EARLY_TERMINATION_FEE" in fact_dict
    assert fact_dict["EARLY_TERMINATION_FEE"].normalized_value["amount"] == 2400.00

    assert "LATE_FEE_PENALTY" in fact_dict
    assert fact_dict["LATE_FEE_PENALTY"].normalized_value["amount"] == 100.00

    assert "EFFECTIVE_DATE" in fact_dict
    assert fact_dict["EFFECTIVE_DATE"].normalized_value["date_iso"] == "2026-11-01"

    assert "EXPIRATION_DATE" in fact_dict
    assert fact_dict["EXPIRATION_DATE"].normalized_value["date_iso"] == "2027-10-31"

    assert "GOVERNING_LAW" in fact_dict
    assert "Illinois" in fact_dict["GOVERNING_LAW"].normalized_value["jurisdiction"]

    # All spans must pass GroundingGate with zero tolerance
    for f in facts:
        assert GroundingGate.verify_span(SAMPLE_CONTRACT_TEXT, f.span) is True


def test_grounding_gate_rejects_hallucinations():
    # Test manipulated / fabricated verbatim text
    invalid_span = RawSourceSpan(
        page_number=1,
        char_start=10,
        char_end=40,
        verbatim_text="THIS TEXT DOES NOT EXIST IN DOCUMENT",
    )
    with pytest.raises(UngroundedSpanError):
        GroundingGate.verify_span(SAMPLE_CONTRACT_TEXT, invalid_span)


@pytest.mark.asyncio
async def test_full_extraction_and_hitl_workflow(client: AsyncClient):
    # 1. Create workspace
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Extraction Test Workspace",
            "slug": "extract-test-ws",
            "owner_email": "extract@example.com",
            "owner_name": "Extractor Tester",
        },
    )
    assert ws_res.status_code == 201
    workspace_id = ws_res.json()["id"]

    # 2. Upload sample contract
    files = {"file": ("lease.txt", SAMPLE_CONTRACT_TEXT.encode("utf-8"), "text/plain")}
    data = {
        "workspace_id": workspace_id,
        "title": "Springfield Lease Agreement",
        "domain_category": "RESIDENTIAL_TENANCY",
    }
    doc_res = await client.post("/api/v1/documents/upload", files=files, data=data)
    assert doc_res.status_code == 201
    doc = doc_res.json()
    doc_id = doc["id"]
    version_id = doc["versions"][0]["id"]

    # 3. Trigger extraction API
    ext_res = await client.post(f"/api/v1/documents/{doc_id}/versions/{version_id}/extract")
    assert ext_res.status_code == 200
    ext_data = ext_res.json()
    assert ext_data["facts_count"] >= 8

    # 4. List extracted facts
    facts_res = await client.get(f"/api/v1/documents/{doc_id}/facts")
    assert facts_res.status_code == 200
    facts = facts_res.json()
    assert len(facts) >= 8

    # Check all facts are initially UNVERIFIED
    for f in facts:
        assert f["verification_status"] == "UNVERIFIED"
        assert f["evidence_span"] is not None

    # 5. HITL Flow: ACCEPT a fact (e.g. BASE_RENT)
    rent_fact = next(f for f in facts if f["fact_key"] == "BASE_RENT")
    acc_res = await client.post(
        f"/api/v1/facts/{rent_fact['id']}/verify",
        json={"action": "ACCEPT"},
    )
    assert acc_res.status_code == 200
    assert acc_res.json()["verification_status"] == "VERIFIED"

    # 6. HITL Flow: EDIT a fact (e.g. LATE_FEE_PENALTY)
    late_fact = next(f for f in facts if f["fact_key"] == "LATE_FEE_PENALTY")
    edit_res = await client.post(
        f"/api/v1/facts/{late_fact['id']}/verify",
        json={
            "action": "EDIT",
            "edited_value": {
                "amount": 75.00,
                "currency": "USD",
                "raw": "Negotiated down to $75.00",
            },
        },
    )
    assert edit_res.status_code == 200
    edited_data = edit_res.json()
    assert edited_data["verification_status"] == "EDITED"
    assert edited_data["normalized_value"]["amount"] == 75.00

    # 7. HITL Flow: REJECT an ambiguous fact
    sec_fact = next(f for f in facts if f["fact_key"] == "SECURITY_DEPOSIT")
    rej_res = await client.post(
        f"/api/v1/facts/{sec_fact['id']}/verify",
        json={"action": "REJECT", "rejection_reason": "Deposit waived by landlord rider"},
    )
    assert rej_res.status_code == 200
    assert rej_res.json()["verification_status"] == "REJECTED"


def test_quarantine_ungrounded_fabricated_facts():
    """Confirms that fabricated or modified quotes are caught and quarantined with status REJECTED_UNGROUNDED."""
    valid_span = RawSourceSpan(
        page_number=1,
        char_start=0,
        char_end=26,
        verbatim_text="RESIDENTIAL LEASE AGREEMENT",
    )
    status_valid = GroundingGate.evaluate_grounding(SAMPLE_CONTRACT_TEXT, valid_span)
    assert status_valid == "VERIFIED"

    hallucinated_span = RawSourceSpan(
        page_number=1,
        char_start=0,
        char_end=26,
        verbatim_text="FABRICATED UNGROUNDED STATEMENT",
    )
    status_invalid = GroundingGate.evaluate_grounding(SAMPLE_CONTRACT_TEXT, hallucinated_span)
    assert status_invalid == "REJECTED_UNGROUNDED"


@pytest.mark.asyncio
async def test_model_adapter_abstraction():
    """Verifies that the provider-agnostic ModelAdapter interface enforces schemas and generates explanations."""
    from pydantic import BaseModel

    from aftermath.extraction.adapter import CloudAdapterFactory, LocalMockAdapter

    class MockExtractResponse(BaseModel):
        found: bool = True
        key: str = "EXTRACTED_TEST"

    adapter = CloudAdapterFactory.create_adapter("mock")
    assert isinstance(adapter, LocalMockAdapter)

    resp = await adapter.extract_structured(
        prompt="Extract test",
        system_instruction="You are a contract extractor",
        response_schema=MockExtractResponse,
    )
    assert resp.found is True

    explanation = await adapter.generate_explanation(
        causal_graph_context="Node 1 -> Node 2",
        user_query="Why is there a penalty?",
    )
    assert "Finding: Obligations are mathematically verified" in explanation
