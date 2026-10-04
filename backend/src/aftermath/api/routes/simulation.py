import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from aftermath.api.deps import get_current_workspace_id
from aftermath.database import get_db
from aftermath.models.simulation import Scenario
from aftermath.simulation.engine import SimulationEngine, SimulationResult

router = APIRouter(prefix="/scenarios", tags=["Scenarios & Simulation"])


class ScenarioCreate(BaseModel):
    workspace_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="")
    variables: List[Dict[str, Any]] = Field(default_factory=list)


class ScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    title: str
    description: str
    variables: List[Dict[str, Any]]
    created_at: datetime


@router.get("", response_model=List[ScenarioResponse])
async def list_scenarios(
    workspace_id: Optional[uuid.UUID] = Depends(get_current_workspace_id),
    db: AsyncSession = Depends(get_db),
) -> List[Scenario]:
    """List scenarios for the active workspace."""
    query = select(Scenario)
    if workspace_id:
        query = query.where(Scenario.workspace_id == workspace_id)
    query = query.order_by(Scenario.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario(
    payload: ScenarioCreate,
    db: AsyncSession = Depends(get_db),
) -> Scenario:
    """Create a new what-if scenario."""
    scenario = Scenario(
        workspace_id=payload.workspace_id,
        title=payload.title,
        description=payload.description,
        variables=payload.variables,
    )
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    return scenario


@router.post("/{scenario_id}/run", response_model=SimulationResult)
async def run_scenario_simulation(
    scenario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> SimulationResult:
    """Executes deterministic discrete event simulation for a counterfactual what-if scenario."""
    return await SimulationEngine.run_scenario_simulation(scenario_id=scenario_id, db=db)


@router.get("/{scenario_id}/compare", response_model=Dict[str, Any])
async def compare_scenario_with_baseline(
    scenario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Provides side-by-side comparison of Baseline vs Counterfactual Scenario."""
    result = await SimulationEngine.run_scenario_simulation(scenario_id=scenario_id, db=db)
    return {
        "scenario_id": scenario_id,
        "baseline": {
            "title": "Current Scheduled Baseline",
            "scheduled_expiration": "2027-10-31",
            "total_rent_liability": 28800.00,
            "early_termination_fee": 0.0,
        },
        "counterfactual": {
            "title": result.scenario_title,
            "net_financial_delta": result.net_financial_delta,
            "derived_consequences": [o.model_dump() for o in result.derived_consequences],
            "uncertain_consequences": [o.model_dump() for o in result.uncertain_consequences],
            "changed_assumptions": [a.model_dump() for a in result.changed_assumptions],
        },
        "reproducible_hash": result.reproducible_hash,
    }
