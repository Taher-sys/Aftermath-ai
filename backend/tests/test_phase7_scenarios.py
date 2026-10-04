import uuid
from datetime import date

import pytest
from httpx import AsyncClient

from aftermath.models.commitment import Commitment
from aftermath.simulation.engine import SimulationEngine


def test_simulation_engine_reproducibility_and_counterfactuals():
    scenario_id = uuid.uuid4()
    c1 = Commitment(
        id=uuid.uuid4(),
        workspace_id=uuid.uuid4(),
        title="Springfield Lease",
        counterparty_name="Oakwood Properties LLC",
        effective_date=date(2026, 11, 1),
        expiration_date=date(2027, 10, 31),
        status="ACTIVE",
    )

    # 1. Same inputs -> identical reproducible result
    variables = [
        {"key": "termination_date", "hypothetical_value": "2027-03-31"},
        {"key": "notice_days_provided", "hypothetical_value": 60},
    ]

    res1 = SimulationEngine.evaluate_scenario(scenario_id, "Test Scenario", variables, [c1])
    res2 = SimulationEngine.evaluate_scenario(scenario_id, "Test Scenario", variables, [c1])

    assert res1.net_financial_delta == res2.net_financial_delta
    assert res1.reproducible_hash == res2.reproducible_hash
    assert len(res1.derived_consequences) == len(res2.derived_consequences)

    # 2. Changed assumption -> correct affected output (insufficient notice triggers penalty)
    vars_insufficient_notice = [
        {"key": "termination_date", "hypothetical_value": "2027-03-31"},
        {"key": "notice_days_provided", "hypothetical_value": 30},  # Deficit: only 30 days!
    ]
    res_notice_penalty = SimulationEngine.evaluate_scenario(
        scenario_id, "Insufficient Notice", vars_insufficient_notice, [c1]
    )

    # Should have penalty for notice deficit ($2,400 deposit forfeiture)
    assert any(
        "Notice Window Deficit Penalty" in o.title for o in res_notice_penalty.derived_consequences
    )
    # Net financial delta should be lower due to penalty
    assert res_notice_penalty.net_financial_delta < res1.net_financial_delta

    # 3. Unrelated assumption -> unaffected output
    vars_unrelated = [
        {"key": "termination_date", "hypothetical_value": "2027-03-31"},
        {"key": "notice_days_provided", "hypothetical_value": 60},
        {"key": "unrelated_noise_var", "hypothetical_value": "blue_walls"},
    ]
    res_unrelated = SimulationEngine.evaluate_scenario(
        scenario_id, "Unrelated Var", vars_unrelated, [c1]
    )
    assert res_unrelated.net_financial_delta == res1.net_financial_delta


@pytest.mark.asyncio
async def test_simulation_api_scenario_run_and_compare(client: AsyncClient):
    # 1. Create workspace
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Scenario Simulation Workspace",
            "slug": "sim-test-ws",
            "owner_email": "sim@example.com",
            "owner_name": "Simulation Scientist",
        },
    )
    assert ws_res.status_code == 201
    workspace_id = ws_res.json()["id"]

    # 2. Create sample commitment
    await client.post(
        "/api/v1/commitments",
        json={
            "workspace_id": workspace_id,
            "title": "Springfield Lease",
            "counterparty_name": "Oakwood Properties LLC",
            "effective_date": "2026-11-01",
            "expiration_date": "2027-10-31",
        },
    )

    # 3. Create scenario
    scen_res = await client.post(
        "/api/v1/scenarios",
        json={
            "workspace_id": workspace_id,
            "title": "What If I Resign & Move on March 31?",
            "description": "Counterfactual early exit 7 months before lease expiration.",
            "variables": [
                {"key": "termination_date", "hypothetical_value": "2027-03-31"},
                {"key": "notice_days_provided", "hypothetical_value": 60},
            ],
        },
    )
    assert scen_res.status_code == 201
    scenario_id = scen_res.json()["id"]

    # 4. Run simulation
    run_res = await client.post(f"/api/v1/scenarios/{scenario_id}/run")
    assert run_res.status_code == 200
    run_data = run_res.json()
    assert run_data["scenario_id"] == scenario_id
    assert len(run_data["derived_consequences"]) >= 2
    assert run_data["net_financial_delta"] > 0

    # 5. Compare with baseline
    cmp_res = await client.get(f"/api/v1/scenarios/{scenario_id}/compare")
    assert cmp_res.status_code == 200
    cmp_data = cmp_res.json()
    assert "baseline" in cmp_data
    assert "counterfactual" in cmp_data
    assert cmp_data["baseline"]["scheduled_expiration"] == "2027-10-31"
