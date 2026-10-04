import uuid
from datetime import date
from decimal import Decimal

import pytest
from httpx import AsyncClient

from aftermath.conflicts.engine import ConflictRuleEngine
from aftermath.models.commitment import Commitment, FinancialTerm, Obligation


def test_conflict_engine_deterministic_rules():
    # 1. Test Invalid Sequence rule
    c_invalid = Commitment(
        id=uuid.uuid4(),
        workspace_id=uuid.uuid4(),
        title="Invalid Sequence Contract",
        counterparty_name="Counterparty",
        effective_date=date(2027, 5, 1),
        expiration_date=date(2026, 5, 1),  # Expiration precedes commencement!
        status="ACTIVE",
    )
    conflicts = ConflictRuleEngine.evaluate_commitments([c_invalid])
    assert any(
        c.conflict_type == "INVALID_SEQUENCE" and c.severity == "CRITICAL" for c in conflicts
    )

    # 2. Test Overlapping Commitments rule
    c1 = Commitment(
        id=uuid.uuid4(),
        workspace_id=uuid.uuid4(),
        title="Lease A",
        counterparty_name="Landlord A",
        effective_date=date(2026, 11, 1),
        expiration_date=date(2027, 10, 31),
        status="ACTIVE",
    )
    c2 = Commitment(
        id=uuid.uuid4(),
        workspace_id=uuid.uuid4(),
        title="Lease B",
        counterparty_name="Landlord B",
        effective_date=date(2027, 1, 1),
        expiration_date=date(2027, 6, 30),
        status="ACTIVE",
    )
    conflicts_overlap = ConflictRuleEngine.evaluate_commitments([c1, c2])
    assert any(c.conflict_type == "TEMPORAL_OVERLAP" for c in conflicts_overlap)

    # 3. Test Recurring Payment Collision rule
    f1 = FinancialTerm(
        id=uuid.uuid4(),
        commitment_id=c1.id,
        term_type="RENT",
        amount=Decimal("2400.00"),
        frequency="MONTHLY",
    )
    f2 = FinancialTerm(
        id=uuid.uuid4(),
        commitment_id=c2.id,
        term_type="MEMBERSHIP",
        amount=Decimal("850.00"),
        frequency="MONTHLY",
    )
    c1.financial_terms = [f1]
    c2.financial_terms = [f2]
    conflicts_recurring = ConflictRuleEngine.evaluate_commitments([c1, c2])
    assert any(c.conflict_type == "RECURRING_PAYMENT_COLLISION" for c in conflicts_recurring)

    # 4. Test Lock-in / Notice without Buyout Fee
    c3 = Commitment(
        id=uuid.uuid4(),
        workspace_id=uuid.uuid4(),
        title="Notice Without Buyout",
        counterparty_name="Vendor",
        effective_date=date(2026, 1, 1),
        expiration_date=date(2026, 12, 31),
        status="ACTIVE",
    )
    c3.obligations = [
        Obligation(
            id=uuid.uuid4(),
            commitment_id=c3.id,
            duty_bearer="SELF",
            modality="MANDATORY",
            description="Tenant must provide sixty (60) days notice prior to cancellation.",
        )
    ]
    c3.financial_terms = []
    conflicts_lockin = ConflictRuleEngine.evaluate_commitments([c3])
    assert any(c.conflict_type == "CANCELLATION_BEFORE_LOCKIN" for c in conflicts_lockin)


@pytest.mark.asyncio
async def test_conflicts_api_workflow(client: AsyncClient):
    # 1. Create workspace
    ws_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Conflict Testing Workspace",
            "slug": "conflict-test-ws",
            "owner_email": "conflict@example.com",
            "owner_name": "Conflict Officer",
        },
    )
    assert ws_res.status_code == 201
    workspace_id = ws_res.json()["id"]

    # 2. Create two overlapping commitments
    await client.post(
        "/api/v1/commitments",
        json={
            "workspace_id": workspace_id,
            "title": "Apartment A",
            "counterparty_name": "Realty A",
            "effective_date": "2026-11-01",
            "expiration_date": "2027-10-31",
        },
    )
    await client.post(
        "/api/v1/commitments",
        json={
            "workspace_id": workspace_id,
            "title": "Apartment B",
            "counterparty_name": "Realty B",
            "effective_date": "2027-01-01",
            "expiration_date": "2027-06-30",
        },
    )

    # 3. Trigger evaluation
    eval_res = await client.post(f"/api/v1/conflicts/evaluate?workspace_id={workspace_id}")
    assert eval_res.status_code == 200
    res_data = eval_res.json()
    assert res_data["total_conflicts"] >= 1
    assert any(c["conflict_type"] == "TEMPORAL_OVERLAP" for c in res_data["conflicts"])

    # 4. List conflicts
    list_res = await client.get(f"/api/v1/conflicts?workspace_id={workspace_id}")
    assert list_res.status_code == 200
    conflicts_list = list_res.json()
    assert len(conflicts_list) >= 1

    # 5. Resolve conflict
    conf_id = conflicts_list[0]["id"]
    resolve_res = await client.post(f"/api/v1/conflicts/{conf_id}/resolve")
    assert resolve_res.status_code == 200
    assert resolve_res.json()["resolution_status"] == "RESOLVED"
