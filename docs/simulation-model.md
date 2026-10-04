# AFTERMATH — Simulation Engine & Consequence Model
**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Classification:** Core Simulation Specification  

---

## 1. Simulation Philosophy: Determinism Over Generative Guesswork

The fundamental question of AFTERMATH is: **"What happens if I do this?"**

In traditional "AI legal tech," this question is delegated to a conversational LLM, which outputs generic prose such as *"You may face some penalties and should consult an attorney."* This is practically useless and dangerous.

In AFTERMATH, consequence simulation is **deterministic and graph-driven**:
1. **The Graph is the Law:** Commitments, obligations, financial penalties, and notice periods form an explicit Directed Acyclic Graph (DAG) of conditions and consequences.
2. **Discrete Event Simulation:** Hypothetical actions (e.g., *"I give notice on October 15"*) are modeled as discrete events scheduled on a virtual timeline.
3. **Deterministic Constraint Solving:** Mathematical engines calculate exact liability sums, notice deficits, forfeiture dates, and penalty triggers.
4. **Epistemic Bounding:** Where a contract clause is genuinely conditional or legally ambiguous (e.g., "reasonable efforts", "material breach"), the engine explicitly flags the node as **Epistemic Uncertainty (Tier 6)** rather than guessing the outcome.

---

## 2. Graph Model of Commitments & Conflicts

The consequence space is represented as a typed, attributed directed graph $\mathcal{G} = (\mathcal{V}, \mathcal{E})$.

### 2.1 Graph Nodes ($\mathcal{V}$)
* **Commitment Nodes ($C$):** High-level contracts or agreements.
* **Obligation Nodes ($O$):** Atomic duties ($O_{self}$, $O_{counterparty}$).
* **Deadline Nodes ($D$):** Absolute or relative points in time.
* **Financial Event Nodes ($F$):** Monetary debits, credits, penalties, or escrows.
* **Condition Nodes ($K$):** Boolean state gates (e.g., $K: \text{DaysLate} > 10$).

### 2.2 Graph Edges ($\mathcal{E}$)
* **`PREREQUISITE` ($u \xrightarrow{pre} v$):** Node $v$ cannot activate or be satisfied until node $u$ is fulfilled (e.g., *Deposit Refund depends on Return of Keys*).
* **`CAUSAL_CONSEQUENCE` ($u \xrightarrow{cause} v$):** The state transition of node $u$ (e.g., Breach) directly triggers node $v$ (e.g., Penalty Fee).
* **`CONFLICTS_WITH` ($u \xleftrightarrow{conflict} v$):** Simultaneous execution or existence of $u$ and $v$ constitutes a contractual or physical breach.
* **`SUPERSEDES` ($u \xrightarrow{sub} v$):** Node $u$ invalidates or replaces node $v$ (e.g., Lease Amendment replaces original Rent Clause).

---

## 3. Four Core Conflict Detection Algorithms

AFTERMATH continuously runs four deterministic conflict detection algorithms across all active commitments in a workspace:

### 3.1 Temporal Overlap & Exclusivity Collision
* **Rule:** If Commitment $A$ demands exclusive full-time personal services within time window $[t_{start}^A, t_{end}^A]$ or geographic bounding box $Geo^A$, and Commitment $B$ demands physical presence at $Geo^B$ where $\text{Distance}(Geo^A, Geo^B) > 50\text{ miles}$, flag a **Blocking Conflict**.
$$\text{Conflict}_{geo} = (t_{start}^A \le t_{end}^B \land t_{start}^B \le t_{end}^A) \land (\text{Distance}(Geo^A, Geo^B) > \text{Threshold})$$

### 3.2 Notice Period Deficit Calculation
* **Rule:** If a scenario specifies a termination date $T_{exit}$ and notice submission date $T_{notice}$, compute the provided notice interval:
$$\Delta t_{provided} = T_{exit} - T_{notice}$$
If $\Delta t_{provided} < \Delta t_{required}$ (where $\Delta t_{required}$ is extracted from the lease/contract), trigger:
1. **Notice Deficit Breach Flag**.
2. **Financial Consequence:** Additional rent/fee liability for $(\Delta t_{required} - \Delta t_{provided})$ days.

### 3.3 Financial Obligation vs. Liquid Reserve Deficit
* **Rule:** Given monthly recurring mandatory outflows $\sum F_{outflow}(t)$ and guaranteed inflows $\sum F_{inflow}(t)$, if cumulative net cashflow falls below zero for any simulation bucket $t$, flag a **Financial Solvency Risk**.

### 3.4 Restrictive Covenant & Non-Compete Overlap
* **Rule:** If Document $A$ (Employment Agreement) contains an active non-compete clause for industry sector $S$ extending through $T_{end} + 12\text{ months}$, and Document $B$ (Freelance Agreement or New Job Offer) is registered under sector $S$ starting prior to $T_{end} + 12\text{ months}$, flag a **Non-Compete Breach Risk** with direct citation to Clause $A$.

---

## 4. Built-in Scenario Archetypes

AFTERMATH provides 8 canonical counterfactual simulation archetypes:

| Archetype | Injected Variables | Deterministic Engine Evaluation | Downstream Output |
| :--- | :--- | :--- | :--- |
| **1. Status Quo (Normal Run)** | No changes; baseline timelines. | Evaluates all scheduled payments, cliffs, and normal expiration dates. | Baseline cumulative financial cost and scheduled completion dates. |
| **2. Early Termination** | `exit_date = T`, `notice_date = T - N`. | Evaluates early buyout clause, notice deficit, deposit forfeiture rules. | Exact exit cost, forfeited deposit, required notice days, release date. |
| **3. Missed Payment / Default** | `payment_date = DueDate + K days`. | Evaluates grace period, calculates daily/flat late fee, checks default acceleration trigger. | Accumulated late fees, default risk flag, cure window deadline. |
| **4. Delayed Counterparty Pay** | `client_payment_date = InvoiceDate + 60d`. | Evaluates personal cashflow reserves, interest penalties (if SOW allows), suspension rights. | Liquidity dip date, right to suspend services without breach. |
| **5. Conflicting Offer Injection** | Add new proposed Commitment $B$. | Cross-references exclusivity, IP assignment, working hours, and non-compete clauses. | Clause-by-clause collision report (e.g., "Moonlighting prohibited by Employer Sec 7.1"). |
| **6. Auto-Renewal Cliff** | User takes no action prior to $T_{renew}$. | Computes automatic renewal extension term and updated price escalator. | New binding end date, locked-in additional financial commitment. |
| **7. Price / Rent Escalator** | Variable inflation or contract clause rate. | Compounds recurring costs according to contract index (CPI, fixed 5%, etc.). | Multi-year cumulative liability curve. |
| **8. Force Majeure / Relocation** | Geographic move or unanticipated disruption. | Evaluates casualty/relocation break clauses and mitigation obligations. | Contractual exit eligibility, disputed liability status. |

---

## 5. Discrete Event Simulation (DES) Algorithm

```python
import heapq
from typing import List, Dict, Any

class SimulationEvent:
    def __init__(self, timestamp: int, priority: int, event_type: str, payload: Dict[str, Any]):
        self.timestamp = timestamp
        self.priority = priority
        self.event_type = event_type
        self.payload = payload

    def __lt__(self, other: "SimulationEvent") -> bool:
        if self.timestamp == other.timestamp:
            return self.priority < other.priority
        return self.timestamp < other.timestamp

class DiscreteEventSimulator:
    def __init__(self, initial_graph: Any, scenario_variables: List[Dict[str, Any]]):
        self.graph = initial_graph
        self.scenario_vars = scenario_variables
        self.event_queue: List[SimulationEvent] = []
        self.current_time: int = 0
        self.timeline_log: List[Dict[str, Any]] = []
        self.cumulative_liabilities: float = 0.0

    def schedule_event(self, event: SimulationEvent):
        heapq.heappush(self.event_queue, event)

    def run(self) -> Dict[str, Any]:
        # 1. Initialize queue with scheduled commitment deadlines & scenario overrides
        self._initialize_events()

        # 2. Process discrete events in strict chronological order
        while self.event_queue:
            event = heapq.heappop(self.event_queue)
            self.current_time = event.timestamp
            self._handle_event(event)

        # 3. Compile deterministic outcomes and causal trace
        return {
            "total_financial_liability": self.cumulative_liabilities,
            "timeline_events": self.timeline_log,
            "engine_status": "COMPLETED"
        }

    def _initialize_events(self):
        # Injects baseline deadlines and user counterfactual perturbations
        pass

    def _handle_event(self, event: SimulationEvent):
        # Evaluates conditions, triggers penalties, and spawns downstream events
        pass
```

---

## 6. Causal Explanation Generation Pipeline

When a simulation finishes, users do not just receive numbers; they receive a **Step-by-Step Causal Trace**:

```
[Simulation Outcome: $4,900 Total Early Exit Cost]
       │
       ├──► Step 1: Early Termination Fee ($2,500.00)
       │    Source: "Lease Sec 14.1 - Early Buyout Option: Equivalent to one month rent."
       │    Evidence: Document 'Lease.pdf', Page 8, Char 412-488.
       │
       ├──► Step 2: Notice Deficit Charge ($1,200.00)
       │    Calculation: Required notice is 60 days. Provided notice was 45 days. 
       │                 15 days deficit * ($2,400 / 30 days) = $1,200.00.
       │    Evidence: Document 'Lease.pdf', Page 3, Char 120-165.
       │
       └──► Step 3: Security Deposit Forfeiture ($1,200.00 of $2,400.00 deposit)
            Source: "Lease Sec 14.3 - Liquidated damages deduction."
            Evidence: Document 'Lease.pdf', Page 8, Char 510-560.
```

Every sentence links back directly to a verified Tier 1 source fact, ensuring that the user and their human advisor can verify the calculation with absolute confidence.
