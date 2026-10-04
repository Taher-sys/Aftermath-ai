import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_document_lifecycle(client: AsyncClient):
    # 1. Create workspace first
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Documents Test Workspace",
            "slug": "docs-test-ws",
            "owner_email": "doc.tester@example.com",
            "owner_name": "Doc Tester",
        },
    )
    assert ws_res.status_code == 201
    workspace_id = ws_res.json()["id"]

    # 2. Create document
    doc_res = await client.post(
        "/api/v1/documents",
        json={
            "title": "Apartment Lease Agreement 2026",
            "domain_category": "RESIDENTIAL_TENANCY",
            "workspace_id": workspace_id,
        },
    )
    assert doc_res.status_code == 201
    doc_data = doc_res.json()
    assert doc_data["title"] == "Apartment Lease Agreement 2026"
    doc_id = doc_data["id"]

    # 3. List documents with X-Workspace-Id
    list_res = await client.get("/api/v1/documents", headers={"X-Workspace-Id": workspace_id})
    assert list_res.status_code == 200
    docs = list_res.json()
    assert len(docs) == 1
    assert docs[0]["id"] == doc_id

    # 4. Get document by ID
    get_res = await client.get(f"/api/v1/documents/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == doc_id
