import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_list_workspaces(client: AsyncClient):
    # 1. Create a workspace
    payload = {
        "name": "Personal Tenancy & Relocation",
        "slug": "personal-tenancy-2026",
        "owner_email": "jane.doe@example.com",
        "owner_name": "Jane Doe",
    }
    response = await client.post("/api/v1/workspaces", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["slug"] == payload["slug"]
    workspace_id = data["id"]

    # 2. Duplicate slug should return 409
    dup_res = await client.post("/api/v1/workspaces", json=payload)
    assert dup_res.status_code == 409

    # 3. Retrieve workspace by ID
    get_res = await client.get(f"/api/v1/workspaces/{workspace_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == workspace_id

    # 4. List all workspaces
    list_res = await client.get("/api/v1/workspaces")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) >= 1
    assert any(item["id"] == workspace_id for item in items)
