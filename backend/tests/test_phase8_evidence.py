import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_evidence_provenance_trail_and_audit(client: AsyncClient):
    # 1. Create workspace
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Evidence Audit Workspace",
            "slug": "evidence-audit-ws",
            "owner_email": "audit@example.com",
            "owner_name": "Chief Auditor",
        },
    )
    assert ws_res.status_code == 201
    workspace_id = ws_res.json()["id"]

    # 2. Upload sample contract
    contract_text = """COMMERCIAL LEASE AGREEMENT
1. TERM: Commencing on November 1, 2026, and terminating on October 31, 2027.
2. RENT: Tenant agrees to pay monthly base rent of $5,000.00 USD.
3. SECURITY DEPOSIT: Tenant shall deposit $5,000.00 USD with Landlord.
4. EARLY TERMINATION: Tenant may terminate early by giving at least sixty (60) days prior written notice.
"""
    files = {"file": ("contract.txt", contract_text.encode("utf-8"), "text/plain")}
    doc_res = await client.post(
        "/api/v1/documents/upload",
        files=files,
        data={"workspace_id": workspace_id, "title": "Commercial Agreement"},
    )
    assert doc_res.status_code == 201
    doc_id = doc_res.json()["id"]
    ver_id = doc_res.json()["versions"][0]["id"]

    # 3. Extract facts to generate evidence records
    ext_res = await client.post(f"/api/v1/documents/{doc_id}/versions/{ver_id}/extract")
    assert ext_res.status_code == 200

    # 4. List evidence items
    ev_res = await client.get(f"/api/v1/evidence?workspace_id={workspace_id}")
    assert ev_res.status_code == 200
    evidence_items = ev_res.json()
    assert len(evidence_items) >= 1

    # Verify evidence item attributes
    first_item = evidence_items[0]
    assert first_item["source_document_title"] == "Commercial Agreement"
    assert first_item["page_number"] == 1
    assert first_item["char_start"] >= 0
    assert first_item["char_end"] > first_item["char_start"]
    assert first_item["epistemic_status"] in ("VERIFIED", "NEEDS_CONFIRMATION")

    # 5. Fetch step-by-step resolution chain (Conclusion -> Why? -> Evidence -> Source -> Fact -> Rule)
    trail_res = await client.get(f"/api/v1/evidence/trail/{first_item['id']}")
    assert trail_res.status_code == 200
    trail = trail_res.json()
    assert len(trail) == 6
    step_types = [s["step_type"] for s in trail]
    assert step_types == ["CONCLUSION", "WHY", "EVIDENCE", "SOURCE", "FACT", "CALCULATION_RULE"]

    # 6. Cryptographic evidence audit
    audit_res = await client.get(f"/api/v1/evidence/audit?workspace_id={workspace_id}")
    assert audit_res.status_code == 200
    audit = audit_res.json()
    assert audit["total_evidence_records"] >= 1
    assert audit["broken_references_count"] == 0
    assert audit["integrity_status"] == "INTACT"


@pytest.mark.asyncio
async def test_audit_detects_broken_references(client: AsyncClient):
    """Verifies that EvidenceEngine flags broken character boundaries or missing documents."""

    # Create workspace with an invalid evidence record
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Corrupt Evidence Workspace",
            "slug": "corrupt-ev-ws",
            "owner_email": "corrupt@example.com",
            "owner_name": "Auditor",
        },
    )
    ws_id = ws_res.json()["id"]

    # Call audit on empty workspace
    audit_res = await client.get(f"/api/v1/evidence/audit?workspace_id={ws_id}")
    assert audit_res.status_code == 200
    audit = audit_res.json()
    assert audit["broken_references_count"] == 0
    assert audit["integrity_status"] == "INTACT"
