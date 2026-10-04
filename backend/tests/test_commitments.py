import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_commitment_lifecycle(client: AsyncClient):
    # 1. Create workspace
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Commitment Test WS",
            "slug": "commit-test-ws",
            "owner_email": "commit.tester@example.com",
            "owner_name": "Commitment Tester",
        },
    )
    assert ws_res.status_code == 201
    workspace_id = ws_res.json()["id"]

    # 2. Create commitment
    payload = {
        "workspace_id": workspace_id,
        "title": "Senior Staff Architect Employment Offer",
        "counterparty_name": "Antigravity Systems Inc",
        "effective_date": "2026-11-01",
        "expiration_date": "2028-11-01",
        "governing_jurisdiction": "California, USA",
    }
    commit_res = await client.post("/api/v1/commitments", json=payload)
    assert commit_res.status_code == 201
    commit_data = commit_res.json()
    assert commit_data["title"] == payload["title"]
    assert commit_data["status"] == "ACTIVE"

    # 3. List commitments
    list_res = await client.get("/api/v1/commitments", headers={"X-Workspace-Id": workspace_id})
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) == 1
    assert items[0]["id"] == commit_data["id"]
