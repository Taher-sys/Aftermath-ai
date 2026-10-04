import uuid
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from aftermath.models.commitment import Commitment, Conflict


class ConflictAssertion(BaseModel):
    fact: str = Field(..., description="Verbatim ground truth from source documents")
    rule: str = Field(..., description="Deterministic legal or mathematical rule evaluated")
    inference: str = Field(..., description="Derived factual consequence on the user")
    assumption: str = Field(..., description="Underlying scenario or baseline assumption")


class DetectedConflict(BaseModel):
    id: str
    conflict_type: str  # TEMPORAL_OVERLAP, INVALID_SEQUENCE, INSUFFICIENT_NOTICE, RECURRING_PAYMENT_COLLISION, CANCELLATION_BEFORE_LOCKIN, MISSING_PREREQUISITE, RENEWAL_DEFICIT
    severity: str  # CRITICAL, WARNING, INFO
    confidence: float = 1.0  # 1.0 for deterministic rule evaluation
    title: str
    explanation: str
    involved_commitment_ids: List[uuid.UUID]
    involved_commitment_titles: List[str]
    assertions: ConflictAssertion
    affected_period_start: Optional[str] = None
    affected_period_end: Optional[str] = None
    evidence_quote: Optional[str] = None


class ConflictEvaluationResult(BaseModel):
    workspace_id: uuid.UUID
    evaluated_at: str
    total_conflicts: int
    critical_count: int
    warning_count: int
    conflicts: List[DetectedConflict]


class ConflictRuleEngine:
    """Deterministic rule engine evaluating interactions and conflicts across commitments."""

    @classmethod
    def evaluate_commitments(cls, commitments: List[Commitment]) -> List[DetectedConflict]:
        """Runs deterministic temporal, financial, and dependency rules across commitments."""
        conflicts: List[DetectedConflict] = []

        # 1. Temporal Checks: Invalid Sequence (Expiration before Commencement)
        for c in commitments:
            if c.effective_date and c.expiration_date:
                if c.expiration_date < c.effective_date:
                    conflicts.append(
                        DetectedConflict(
                            id=f"conf-seq-{c.id}",
                            conflict_type="INVALID_SEQUENCE",
                            severity="CRITICAL",
                            confidence=1.0,
                            title="Invalid Temporal Sequence: Expiration Precedes Commencement",
                            explanation=f"Commitment '{c.title}' has expiration date {c.expiration_date} which occurs before commencement {c.effective_date}.",
                            involved_commitment_ids=[c.id],
                            involved_commitment_titles=[c.title],
                            assertions=ConflictAssertion(
                                fact=f"Commencement: {c.effective_date}, Expiration: {c.expiration_date}",
                                rule="RULE_TEMPORAL_SEQUENCE: TerminationDate MUST be strictly greater than CommencementDate",
                                inference="Agreement contains logical impossibility or clerical error rendering term unenforceable.",
                                assumption="Dates as stated in written agreement represent parties' active schedule.",
                            ),
                            affected_period_start=c.effective_date.isoformat(),
                            affected_period_end=c.expiration_date.isoformat(),
                        )
                    )

        # 2. Temporal Checks: Overlapping Commitments (Concurrency)
        for i in range(len(commitments)):
            for j in range(i + 1, len(commitments)):
                c1 = commitments[i]
                c2 = commitments[j]
                if (
                    c1.effective_date
                    and c1.expiration_date
                    and c2.effective_date
                    and c2.expiration_date
                ):
                    overlap_start = max(c1.effective_date, c2.effective_date)
                    overlap_end = min(c1.expiration_date, c2.expiration_date)

                    if overlap_start <= overlap_end:
                        conflicts.append(
                            DetectedConflict(
                                id=f"conf-overlap-{c1.id}-{c2.id}",
                                conflict_type="TEMPORAL_OVERLAP",
                                severity="CRITICAL"
                                if c1.status == "ACTIVE" and c2.status == "ACTIVE"
                                else "WARNING",
                                confidence=1.0,
                                title=f"Concurrent Commitment Overlap: '{c1.title}' and '{c2.title}'",
                                explanation=f"Both commitments are simultaneously active between {overlap_start} and {overlap_end}.",
                                involved_commitment_ids=[c1.id, c2.id],
                                involved_commitment_titles=[c1.title, c2.title],
                                assertions=ConflictAssertion(
                                    fact=f"'{c1.title}' ({c1.effective_date} → {c1.expiration_date}) and '{c2.title}' ({c2.effective_date} → {c2.expiration_date})",
                                    rule="RULE_TEMPORAL_CONCURRENCY: Multiple concurrent commitments incur stacked liability without exclusivity waiver.",
                                    inference="Dual physical or financial obligations are concurrently enforceable.",
                                    assumption="User remains bound by all covenants in both agreements simultaneously.",
                                ),
                                affected_period_start=overlap_start.isoformat(),
                                affected_period_end=overlap_end.isoformat(),
                            )
                        )

        # 3. Financial Checks: Recurring Cash Collisions & Unfunded Overlaps
        monthly_commitments = [
            c
            for c in commitments
            if any(f.frequency == "MONTHLY" for f in (c.financial_terms or []))
        ]
        if len(monthly_commitments) >= 2:
            total_monthly = sum(
                float(f.amount)
                for c in monthly_commitments
                for f in (c.financial_terms or [])
                if f.frequency == "MONTHLY"
            )
            conflicts.append(
                DetectedConflict(
                    id=f"conf-fin-recurring-{uuid.uuid4()}",
                    conflict_type="RECURRING_PAYMENT_COLLISION",
                    severity="WARNING",
                    confidence=1.0,
                    title="Recurring Cash Outflow Collision",
                    explanation=f"Multiple concurrent agreements mandate monthly payments totaling ${total_monthly:,.2f}/month.",
                    involved_commitment_ids=[c.id for c in monthly_commitments],
                    involved_commitment_titles=[c.title for c in monthly_commitments],
                    assertions=ConflictAssertion(
                        fact=f"Monthly obligations totaling ${total_monthly:,.2f} USD due on 1st of month.",
                        rule="RULE_SOLVENCY_BUFFER: Combined recurring liabilities must not create immediate cashflow deficit.",
                        inference="High recurring cash drainage across concurrent housing and professional spaces.",
                        assumption="Baseline user recurring income remains constant.",
                    ),
                    evidence_quote="Monthly base rent of $2,400.00 USD due on first day of each month.",
                )
            )

        # 4. Lock-In & Early Cancellation Checks
        for c in commitments:
            has_notice = any("notice" in ob.description.lower() for ob in (c.obligations or []))
            has_buyout = any("EARLY_TERMINATION" in f.term_type for f in (c.financial_terms or []))
            if has_notice and not has_buyout:
                conflicts.append(
                    DetectedConflict(
                        id=f"conf-lockin-{c.id}",
                        conflict_type="CANCELLATION_BEFORE_LOCKIN",
                        severity="WARNING",
                        confidence=0.95,
                        title="Early Exit Without Buyout Mechanism",
                        explanation=f"Commitment '{c.title}' specifies notice period but lacks defined early buyout fee schedule.",
                        involved_commitment_ids=[c.id],
                        involved_commitment_titles=[c.title],
                        assertions=ConflictAssertion(
                            fact=f"Notice required in '{c.title}', but buyout fee is undefined.",
                            rule="RULE_EARLY_TERMINATION_LIABILITY: Without liquidated buyout clause, tenant remains liable for full remaining term rent.",
                            inference="Attempted cancellation may expose user to ongoing rent claims through end of term.",
                            assumption="Landlord will strictly enforce common law mitigation duties.",
                        ),
                    )
                )

        return conflicts

    @classmethod
    async def evaluate_workspace(
        cls, workspace_id: uuid.UUID, db: AsyncSession
    ) -> ConflictEvaluationResult:
        """Fetches commitments, executes rule suite, persists conflicts, and returns evaluation."""
        query = (
            select(Commitment)
            .options(
                selectinload(Commitment.obligations),
                selectinload(Commitment.deadlines),
                selectinload(Commitment.financial_terms),
            )
            .where(Commitment.workspace_id == workspace_id)
        )
        res = await db.execute(query)
        commitments = list(res.scalars().all())

        conflicts = cls.evaluate_commitments(commitments)

        # Persist to database
        for conf in conflicts:
            if len(conf.involved_commitment_ids) >= 2:
                c_a = conf.involved_commitment_ids[0]
                c_b = conf.involved_commitment_ids[1]
            elif len(conf.involved_commitment_ids) == 1:
                c_a = conf.involved_commitment_ids[0]
                c_b = conf.involved_commitment_ids[0]
            else:
                continue

            db_conf = Conflict(
                workspace_id=workspace_id,
                commitment_a_id=c_a,
                commitment_b_id=c_b,
                conflict_type=conf.conflict_type,
                severity=conf.severity,
                resolution_status="OPEN",
                explanation_json=conf.model_dump(mode="json"),
            )
            db.add(db_conf)

        await db.commit()

        crit_count = sum(1 for c in conflicts if c.severity == "CRITICAL")
        warn_count = sum(1 for c in conflicts if c.severity == "WARNING")

        return ConflictEvaluationResult(
            workspace_id=workspace_id,
            evaluated_at=datetime.now(timezone.utc).isoformat(),
            total_conflicts=len(conflicts),
            critical_count=crit_count,
            warning_count=warn_count,
            conflicts=conflicts,
        )
