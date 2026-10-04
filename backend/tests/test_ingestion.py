import pytest
from httpx import AsyncClient

from aftermath.ingestion.validator import MAX_FILE_SIZE_BYTES, DocumentValidator, ValidationError

SAMPLE_LEASE_TEXT = """RESIDENTIAL LEASE AGREEMENT
This agreement is made on October 1, 2026, between Oakwood Properties LLC ("Landlord")
and Alex Mercer ("Tenant").
1. Premises: 742 Evergreen Terrace, Apt 4B, Springfield.
2. Term: 12 months, beginning November 1, 2026 and ending October 31, 2027.
3. Rent: The monthly rent shall be $2,400.00 USD, payable on the first day of each month.
4. Security Deposit: Tenant shall deposit $2,400.00 USD upon signing.
5. Notice & Early Termination: Tenant must give sixty (60) days prior written notice.
   Early termination fee is equivalent to one month's rent ($2,400.00 USD).
6. Late Fee: A late fee of $100.00 USD will be charged on rent received after the 5th.
"""


@pytest.mark.asyncio
async def test_upload_valid_text_document(client: AsyncClient, tmp_path):
    # 1. Create workspace
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Lease Vault Workspace",
            "slug": "lease-vault-ws",
            "owner_email": "tenant@example.com",
            "owner_name": "Alex Mercer",
        },
    )
    assert ws_res.status_code == 201
    workspace_id = ws_res.json()["id"]

    # 2. Upload text document
    files = {"file": ("lease_agreement.txt", SAMPLE_LEASE_TEXT.encode("utf-8"), "text/plain")}
    data = {
        "workspace_id": workspace_id,
        "title": "Apartment 4B Lease",
        "domain_category": "RESIDENTIAL_TENANCY",
    }
    upload_res = await client.post("/api/v1/documents/upload", files=files, data=data)
    assert upload_res.status_code == 201
    doc = upload_res.json()
    assert doc["title"] == "Apartment 4B Lease"
    assert doc["domain_category"] == "RESIDENTIAL_TENANCY"
    assert len(doc["versions"]) == 1
    ver = doc["versions"][0]
    assert ver["processing_status"] == "PROCESSED"
    assert ver["mime_type"] == "text/plain"
    assert ver["page_count"] == 1
    assert len(ver["sha256_hash"]) == 64

    # 3. Retrieve document content
    content_res = await client.get(f"/api/v1/documents/{doc['id']}/versions/{ver['id']}/content")
    assert content_res.status_code == 200
    content = content_res.json()
    assert "RESIDENTIAL LEASE AGREEMENT" in content["full_text"]
    assert content["page_count"] == 1


@pytest.mark.asyncio
async def test_upload_duplicate_file_rejected(client: AsyncClient):
    # 1. Create workspace
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Deduplication Workspace",
            "slug": "dedup-ws",
            "owner_email": "dedup@example.com",
            "owner_name": "Dedup Tester",
        },
    )
    assert ws_res.status_code == 201
    workspace_id = ws_res.json()["id"]

    # 2. Upload document first time
    files = {"file": ("contract.txt", b"Exact contract text content for hashing", "text/plain")}
    data = {"workspace_id": workspace_id, "title": "Contract v1"}
    res1 = await client.post("/api/v1/documents/upload", files=files, data=data)
    assert res1.status_code == 201

    # 3. Upload identical document second time in same workspace -> 409 Conflict
    files2 = {
        "file": ("contract_copy.txt", b"Exact contract text content for hashing", "text/plain")
    }
    data2 = {"workspace_id": workspace_id, "title": "Contract v1 Duplicate"}
    res2 = await client.post("/api/v1/documents/upload", files=files2, data=data2)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_reject_unsupported_file_format(client: AsyncClient):
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Security Test Workspace",
            "slug": "security-ws",
            "owner_email": "security@example.com",
            "owner_name": "Sec Tester",
        },
    )
    workspace_id = ws_res.json()["id"]

    # Attempt to upload executable / shell script
    files = {
        "file": (
            "exploit.exe",
            b"MZ\x90\x00\x03\x00\x00\x00fake_executable",
            "application/x-msdownload",
        )
    }
    data = {"workspace_id": workspace_id, "title": "Exploit"}
    res = await client.post("/api/v1/documents/upload", files=files, data=data)
    assert res.status_code == 400
    assert "Unsupported or malformed" in res.json()["detail"]


def test_validator_oversized_file():
    # Test oversized file boundary check
    fake_huge = b"x" * (MAX_FILE_SIZE_BYTES + 10)
    with pytest.raises(ValidationError, match="exceeds maximum allowed limit"):
        DocumentValidator.validate_file(fake_huge, "huge.txt", "text/plain")


def test_validator_pdf_active_script_sanitization():
    # PDF with embedded JavaScript action
    malicious_pdf = b"%PDF-1.4\n1 0 obj\n<< /Type /Action /S /JavaScript /JS (app.alert('PWNED');) >>\nendobj\n%%EOF"
    with pytest.raises(ValidationError, match="embedded JavaScript"):
        DocumentValidator.validate_file(malicious_pdf, "evil.pdf", "application/pdf")
