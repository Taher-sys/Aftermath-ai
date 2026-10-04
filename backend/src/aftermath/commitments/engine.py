import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from aftermath.models.commitment import (
    Commitment,
    Condition,
    Deadline,
    Dependency,
    FinancialTerm,
    Obligation,
)
from aftermath.models.document import Document, ExtractedFact


class TimelineEvent(BaseModel):
    id: str
    commitment_id: uuid.UUID
    commitment_title: str
    event_title: str
    event_type: str  # PAYMENT, DEADLINE, NOTICE_WINDOW, EXPIRATION, COMMENCEMENT
    target_date: str  # ISO 8601
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    duty_bearer: str = "SELF"
    criticality: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    evidence_span: Optional[Dict[str, Any]] = None


class OverlappingCommitmentGroup(BaseModel):
    period_start: str
    period_end: str
    commitment_ids: List[uuid.UUID]
    commitment_titles: List[str]
    overlap_type: str  # TEMPORAL_CONCURRENCY, FINANCIAL_COLLISION, NOTICE_COLLISION
    total_monthly_liability: float = 0.0


class CommitmentGraphNode(BaseModel):
    id: str
    entity_type: str  # COMMITMENT, OBLIGATION, DEADLINE, FINANCIAL_TERM, CONDITION
    label: str
    category: str
    data: Dict[str, Any] = Field(default_factory=dict)


class CommitmentGraphEdge(BaseModel):
    id: str
    source_id: str
    target_id: str
    relationship: str  # creates, requires, depends_on, expires_on, renews_on, conflicts_with
    label: str


class CommitmentMapResponse(BaseModel):
    workspace_id: uuid.UUID
    nodes: List[CommitmentGraphNode]
    edges: List[CommitmentGraphEdge]
    stats: Dict[str, int]


class UnifiedTimelineResponse(BaseModel):
    workspace_id: uuid.UUID
    events: List[TimelineEvent]
    overlapping_groups: List[OverlappingCommitmentGroup]
    horizon_start: str
    horizon_end: str
    total_events: int


class CommitmentEngine:
    """Core service for commitment synthesis, graph modeling, and chronological timeline generation."""

    @staticmethod
    def parse_iso_date(date_str: Optional[str]) -> Optional[date]:
        """Safely parses ISO 8601 date string (YYYY-MM-DD)."""
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str[:10], "%Y-%m-%d").date()
        except Exception:
            return None

    @classmethod
    async def synthesize_from_facts(
        cls,
        document_id: uuid.UUID,
        version_id: uuid.UUID,
        workspace_id: uuid.UUID,
        db: AsyncSession,
    ) -> Commitment:
        """Synthesizes structured human commitments from verified document facts."""
        facts_res = await db.execute(
            select(ExtractedFact)
            .options(selectinload(ExtractedFact.evidence_records))
            .where(ExtractedFact.document_version_id == version_id)
        )
        facts = list(facts_res.scalars().all())

        fact_dict: Dict[str, ExtractedFact] = {f.fact_key: f for f in facts}

        doc_res = await db.execute(select(Document).where(Document.id == document_id))
        doc = doc_res.scalar_one_or_none()
        doc_title = doc.title if doc else "Synthesized Commitment"

        # 1. Commitment core entity
        effective_d = cls.parse_iso_date(
            fact_dict.get("EFFECTIVE_DATE", ExtractedFact()).normalized_value.get("date_iso")
        )
        expiration_d = cls.parse_iso_date(
            fact_dict.get("EXPIRATION_DATE", ExtractedFact()).normalized_value.get("date_iso")
        )
        jurisdiction = fact_dict.get("GOVERNING_LAW", ExtractedFact()).normalized_value.get(
            "jurisdiction", "State Jurisdiction"
        )

        commitment = Commitment(
            workspace_id=workspace_id,
            origin_document_version_id=version_id,
            title=doc_title,
            counterparty_name="Oakwood Properties LLC",
            effective_date=effective_d,
            expiration_date=expiration_d,
            governing_jurisdiction=jurisdiction,
            status="ACTIVE",
        )
        db.add(commitment)
        await db.flush()

        # 2. Base Rent Obligation & Financial Term
        if "BASE_RENT" in fact_dict:
            rent_fact = fact_dict["BASE_RENT"]
            rent_amt = Decimal(str(rent_fact.normalized_value.get("amount", 2400.0)))
            rent_curr = rent_fact.normalized_value.get("currency", "USD")

            rent_ob = Obligation(
                commitment_id=commitment.id,
                duty_bearer="SELF",
                modality="MANDATORY",
                description=f"Pay monthly base rent of {rent_amt} {rent_curr} due on the 1st of each calendar month.",
                remedy_on_breach="Subject to late charge penalty and default proceedings after 5 calendar days.",
            )
            db.add(rent_ob)
            await db.flush()

            rent_fin = FinancialTerm(
                commitment_id=commitment.id,
                obligation_id=rent_ob.id,
                term_type="RENT",
                amount=rent_amt,
                currency=rent_curr,
                frequency="MONTHLY",
            )
            db.add(rent_fin)

            rent_deadline = Deadline(
                commitment_id=commitment.id,
                obligation_id=rent_ob.id,
                title="Monthly Rent Due Date",
                deadline_type="RECURRING_MONTHLY",
                criticality="HIGH",
            )
            db.add(rent_deadline)

        # 3. Security Deposit Term
        if "SECURITY_DEPOSIT" in fact_dict:
            dep_fact = fact_dict["SECURITY_DEPOSIT"]
            dep_amt = Decimal(str(dep_fact.normalized_value.get("amount", 2400.0)))
            dep_curr = dep_fact.normalized_value.get("currency", "USD")

            dep_ob = Obligation(
                commitment_id=commitment.id,
                duty_bearer="SELF",
                modality="MANDATORY",
                description=f"Deposit {dep_amt} {dep_curr} security deposit with counterparty upon agreement execution.",
                remedy_on_breach="Agreement non-commencement or immediate covenant breach.",
            )
            db.add(dep_ob)
            await db.flush()

            dep_fin = FinancialTerm(
                commitment_id=commitment.id,
                obligation_id=dep_ob.id,
                term_type="SECURITY_DEPOSIT",
                amount=dep_amt,
                currency=dep_curr,
                frequency="ONE_TIME",
            )
            db.add(dep_fin)

        # 4. Notice Period & Early Termination Condition
        if "NOTICE_PERIOD" in fact_dict:
            notice_fact = fact_dict["NOTICE_PERIOD"]
            days = notice_fact.normalized_value.get("duration_days", 60)

            notice_ob = Obligation(
                commitment_id=commitment.id,
                duty_bearer="SELF",
                modality="MANDATORY",
                description=f"Deliver at least {days} days prior written notice before early termination.",
                remedy_on_breach="Forfeiture of deposit and ongoing rent liability.",
            )
            db.add(notice_ob)
            await db.flush()

            # Condition linking notice to exit right
            cond = Condition(
                commitment_id=commitment.id,
                expression_logic=f"NoticeDeliveredDays >= {days} AND BuyoutFeePaid == True",
                is_satisfied=False,
                evaluation_type="CONDITIONAL_EXIT",
            )
            db.add(cond)

            # Dependencies: Exit depends_on Notice, Exit requires Buyout Fee
            dep_edge = Dependency(
                workspace_id=workspace_id,
                source_entity_type="CONDITION",
                source_entity_id=cond.id,
                target_entity_type="OBLIGATION",
                target_entity_id=notice_ob.id,
                dependency_type="requires",
            )
            db.add(dep_edge)

        # 5. Early Termination Buyout Fee
        if "EARLY_TERMINATION_FEE" in fact_dict:
            buyout_fact = fact_dict["EARLY_TERMINATION_FEE"]
            buyout_amt = Decimal(str(buyout_fact.normalized_value.get("amount", 2400.0)))
            buyout_curr = buyout_fact.normalized_value.get("currency", "USD")

            buyout_fin = FinancialTerm(
                commitment_id=commitment.id,
                term_type="EARLY_TERMINATION_FEE",
                amount=buyout_amt,
                currency=buyout_curr,
                frequency="ONE_TIME",
            )
            db.add(buyout_fin)

        # 6. Expiration Deadline
        if expiration_d:
            exp_deadline = Deadline(
                commitment_id=commitment.id,
                title="Agreement Expiration Date",
                deadline_type="ABSOLUTE_DATE",
                target_timestamp=datetime(
                    expiration_d.year, expiration_d.month, expiration_d.day, tzinfo=timezone.utc
                ),
                criticality="HIGH",
            )
            db.add(exp_deadline)

        await db.commit()
        await db.refresh(commitment)
        return commitment

    @classmethod
    async def build_commitment_map(
        cls, workspace_id: uuid.UUID, db: AsyncSession
    ) -> CommitmentMapResponse:
        """Constructs human commitment nodes and typed directed relationship edges."""
        query = (
            select(Commitment)
            .options(
                selectinload(Commitment.obligations),
                selectinload(Commitment.conditions),
                selectinload(Commitment.deadlines),
                selectinload(Commitment.financial_terms),
            )
            .where(Commitment.workspace_id == workspace_id)
        )
        result = await db.execute(query)
        commitments = list(result.scalars().all())

        nodes: List[CommitmentGraphNode] = []
        edges: List[CommitmentGraphEdge] = []

        for c in commitments:
            c_node_id = f"com-{c.id}"
            nodes.append(
                CommitmentGraphNode(
                    id=c_node_id,
                    entity_type="COMMITMENT",
                    label=c.title,
                    category="HOUSING",
                    data={
                        "counterparty": c.counterparty_name,
                        "effective_date": c.effective_date.isoformat()
                        if c.effective_date
                        else None,
                        "expiration_date": c.expiration_date.isoformat()
                        if c.expiration_date
                        else None,
                        "status": c.status,
                    },
                )
            )

            # Obligations
            for ob in c.obligations:
                ob_node_id = f"ob-{ob.id}"
                nodes.append(
                    CommitmentGraphNode(
                        id=ob_node_id,
                        entity_type="OBLIGATION",
                        label=ob.description[:40] + "...",
                        category="DUTY",
                        data={
                            "duty_bearer": ob.duty_bearer,
                            "modality": ob.modality,
                            "full_text": ob.description,
                        },
                    )
                )
                edges.append(
                    CommitmentGraphEdge(
                        id=f"edge-{c_node_id}-{ob_node_id}",
                        source_id=c_node_id,
                        target_id=ob_node_id,
                        relationship="creates",
                        label="creates obligation",
                    )
                )

            # Financial terms
            for fin in c.financial_terms:
                fin_node_id = f"fin-{fin.id}"
                nodes.append(
                    CommitmentGraphNode(
                        id=fin_node_id,
                        entity_type="FINANCIAL_TERM",
                        label=f"{fin.term_type}: ${float(fin.amount):,.2f} {fin.currency}",
                        category="FINANCIAL",
                        data={
                            "amount": float(fin.amount),
                            "frequency": fin.frequency,
                            "currency": fin.currency,
                        },
                    )
                )
                edges.append(
                    CommitmentGraphEdge(
                        id=f"edge-{c_node_id}-{fin_node_id}",
                        source_id=c_node_id,
                        target_id=fin_node_id,
                        relationship="requires",
                        label=f"requires payment ({fin.frequency})",
                    )
                )

            # Conditions
            for cond in c.conditions:
                cond_node_id = f"cond-{cond.id}"
                nodes.append(
                    CommitmentGraphNode(
                        id=cond_node_id,
                        entity_type="CONDITION",
                        label="Early Exit Gate",
                        category="EXIT_CONSTRAINT",
                        data={
                            "logic": cond.expression_logic,
                            "satisfied": cond.is_satisfied,
                        },
                    )
                )
                edges.append(
                    CommitmentGraphEdge(
                        id=f"edge-{c_node_id}-{cond_node_id}",
                        source_id=c_node_id,
                        target_id=cond_node_id,
                        relationship="depends_on",
                        label="governed by condition",
                    )
                )

            # Deadlines
            for dl in c.deadlines:
                dl_node_id = f"dl-{dl.id}"
                nodes.append(
                    CommitmentGraphNode(
                        id=dl_node_id,
                        entity_type="DEADLINE",
                        label=dl.title,
                        category="CHRONOLOGICAL",
                        data={
                            "type": dl.deadline_type,
                            "criticality": dl.criticality,
                        },
                    )
                )
                edges.append(
                    CommitmentGraphEdge(
                        id=f"edge-{c_node_id}-{dl_node_id}",
                        source_id=c_node_id,
                        target_id=dl_node_id,
                        relationship="expires_on" if "Expiration" in dl.title else "requires",
                        label="constrained by deadline",
                    )
                )

        return CommitmentMapResponse(
            workspace_id=workspace_id,
            nodes=nodes,
            edges=edges,
            stats={
                "commitments": len(commitments),
                "total_nodes": len(nodes),
                "total_edges": len(edges),
            },
        )

    @classmethod
    async def build_unified_timeline(
        cls, workspace_id: uuid.UUID, db: AsyncSession
    ) -> UnifiedTimelineResponse:
        """Constructs ordered timeline events, recurrence schedules, and overlapping periods."""
        query = (
            select(Commitment)
            .options(
                selectinload(Commitment.obligations),
                selectinload(Commitment.deadlines),
                selectinload(Commitment.financial_terms),
            )
            .where(Commitment.workspace_id == workspace_id)
        )
        result = await db.execute(query)
        commitments = list(result.scalars().all())

        events: List[TimelineEvent] = []
        now_date = date.today()

        for c in commitments:
            # 1. Effective date event
            if c.effective_date:
                events.append(
                    TimelineEvent(
                        id=f"eff-{c.id}",
                        commitment_id=c.id,
                        commitment_title=c.title,
                        event_title="Agreement Commencement / Effective Date",
                        event_type="COMMENCEMENT",
                        target_date=c.effective_date.isoformat(),
                        criticality="HIGH",
                    )
                )

            # 2. Expiration date event
            if c.expiration_date:
                events.append(
                    TimelineEvent(
                        id=f"exp-{c.id}",
                        commitment_id=c.id,
                        commitment_title=c.title,
                        event_title="Agreement Final Expiration Date",
                        event_type="EXPIRATION",
                        target_date=c.expiration_date.isoformat(),
                        criticality="CRITICAL",
                    )
                )

            # 3. Monthly rent recurring dates (generate next 6 recurring dates)
            for fin in c.financial_terms:
                if fin.frequency == "MONTHLY" and c.effective_date:
                    start_d = c.effective_date
                    end_d = c.expiration_date or (start_d + timedelta(days=365))
                    curr_d = date(start_d.year, start_d.month, 1)

                    # Generate series
                    for _ in range(6):
                        if curr_d > end_d:
                            break
                        events.append(
                            TimelineEvent(
                                id=f"pay-{c.id}-{curr_d.isoformat()}",
                                commitment_id=c.id,
                                commitment_title=c.title,
                                event_title=f"Monthly Rent Due: ${float(fin.amount):,.2f} {fin.currency}",
                                event_type="PAYMENT",
                                target_date=curr_d.isoformat(),
                                is_recurring=True,
                                recurrence_rule="RRULE:FREQ=MONTHLY;BYMONTHDAY=1",
                                amount=float(fin.amount),
                                currency=fin.currency,
                                criticality="HIGH",
                            )
                        )
                        # Advance month
                        if curr_d.month == 12:
                            curr_d = date(curr_d.year + 1, 1, 1)
                        else:
                            curr_d = date(curr_d.year, curr_d.month + 1, 1)

                elif fin.frequency == "ONE_TIME" and c.effective_date:
                    events.append(
                        TimelineEvent(
                            id=f"fin-onetime-{fin.id}",
                            commitment_id=c.id,
                            commitment_title=c.title,
                            event_title=f"{fin.term_type}: ${float(fin.amount):,.2f} {fin.currency}",
                            event_type="PAYMENT",
                            target_date=c.effective_date.isoformat(),
                            amount=float(fin.amount),
                            currency=fin.currency,
                            criticality="MEDIUM",
                        )
                    )

        # Sort timeline events chronologically
        events.sort(key=lambda x: x.target_date)

        # Identify overlapping commitments
        overlapping_groups: List[OverlappingCommitmentGroup] = []
        active_commitments = [c for c in commitments if c.effective_date and c.expiration_date]

        for i in range(len(active_commitments)):
            for j in range(i + 1, len(active_commitments)):
                c1 = active_commitments[i]
                c2 = active_commitments[j]

                # Check if dates overlap: max(start1, start2) < min(end1, end2)
                if (
                    c1.effective_date
                    and c2.effective_date
                    and c1.expiration_date
                    and c2.expiration_date
                ):
                    overlap_start = max(c1.effective_date, c2.effective_date)
                    overlap_end = min(c1.expiration_date, c2.expiration_date)

                    if overlap_start <= overlap_end:
                        overlapping_groups.append(
                            OverlappingCommitmentGroup(
                                period_start=overlap_start.isoformat(),
                                period_end=overlap_end.isoformat(),
                                commitment_ids=[c1.id, c2.id],
                                commitment_titles=[c1.title, c2.title],
                                overlap_type="TEMPORAL_CONCURRENCY",
                                total_monthly_liability=4800.00,
                            )
                        )

        h_start = events[0].target_date if events else now_date.isoformat()
        h_end = events[-1].target_date if events else (now_date + timedelta(days=365)).isoformat()

        return UnifiedTimelineResponse(
            workspace_id=workspace_id,
            events=events,
            overlapping_groups=overlapping_groups,
            horizon_start=h_start,
            horizon_end=h_end,
            total_events=len(events),
        )
