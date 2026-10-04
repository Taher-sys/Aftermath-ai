from datetime import date

import pytest
from httpx import AsyncClient

from aftermath.commitments.engine import CommitmentEngine


def test_commitment_engine_date_normalization():
    """Tests deterministic normalization of dates."""
    assert CommitmentEngine.parse_iso_date("2026-11-01") == date(2026, 11, 1)
    assert CommitmentEngine.parse_iso_date("2027-10-31T00:00:00Z") == date(2027, 10, 31)
    assert CommitmentEngine.parse_iso_date("invalid-date") is None
    assert CommitmentEngine.parse_iso_date(None) is None


@pytest.mark.asyncio
async def test_phase5_commitment_synthesis_and_timeline_workflow(client: AsyncClient):
    # 1. Create workspace
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Commitment & Timeline Workspace",
            "slug": "phase5-timeline-ws",
            "owner_email": "timeline@example.com",
            "owner_name": "Timeline Architect",
        },
    )
    assert ws_res.status_code == 201
    workspace_id = ws_res.json()["id"]

    # 2. Create sample commitment A (Springfield Lease)
    c1_res = await client.post(
        "/api/v1/commitments",
        json={
            "workspace_id": workspace_id,
            "title": "Springfield Residential Lease",
            "counterparty_name": "Oakwood Properties LLC",
            "effective_date": "2026-11-01",
            "expiration_date": "2027-10-31",
            "governing_jurisdiction": "State of Illinois",
        },
    )
    assert c1_res.status_code == 201
    assert "id" in c1_res.json()

    # 3. Create sample commitment B (Overlapping Sublease)
    c2_res = await client.post(
        "/api/v1/commitments",
        json={
            "workspace_id": workspace_id,
            "title": "Chicago Studio Sublease",
            "counterparty_name": "Metro Living LLC",
            "effective_date": "2027-01-01",
            "expiration_date": "2027-06-30",
            "governing_jurisdiction": "State of Illinois",
        },
    )
    assert c2_res.status_code == 201
    assert "id" in c2_res.json()

    # 4. Fetch Commitment Map
    map_res = await client.get(f"/api/v1/commitments/map?workspace_id={workspace_id}")
    assert map_res.status_code == 200
    map_data = map_res.json()
    assert len(map_data["nodes"]) >= 2
    assert map_data["stats"]["commitments"] >= 2

    # 5. Fetch Unified Timeline and verify ordering & overlapping commitments
    time_res = await client.get(f"/api/v1/commitments/timeline?workspace_id={workspace_id}")
    assert time_res.status_code == 200
    timeline = time_res.json()

    # Timeline events must be strictly ordered
    events = timeline["events"]
    assert len(events) >= 2
    target_dates = [e["target_date"] for e in events]
    assert target_dates == sorted(target_dates)

    # Overlapping commitments detected between Springfield Lease and Chicago Sublease
    overlaps = timeline["overlapping_groups"]
    assert len(overlaps) >= 1
    overlap = overlaps[0]
    assert overlap["overlap_type"] == "TEMPORAL_CONCURRENCY"
    assert overlap["period_start"] == "2027-01-01"
    assert overlap["period_end"] == "2027-06-30"
