# AFTERMATH — Data Model & Physical Schema Specification
**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Classification:** Core Database Specification  

---

## 1. Relational Design Principles & Standards

AFTERMATH enforces strict database engineering standards on PostgreSQL 16+:
1. **Primary Keys:** Version 4 UUIDs generated via `gen_random_uuid()`. Prevents sequential ID harvesting and enables client-side UUID generation for optimistic UI updates.
2. **Timestamps:** Always `TIMESTAMPTZ` (UTC with timezone). Naive timestamps are strictly prohibited.
3. **Monetary Values:** Stored as `NUMERIC(14, 2)` or `NUMERIC(18, 4)`. Floating point types (`REAL`, `FLOAT`, `DOUBLE PRECISION`) are prohibited for financial calculations to prevent precision corruption.
4. **Currencies:** Stored as standard ISO 4217 three-letter uppercase codes (e.g., `USD`, `EUR`, `GBP`).
5. **Strings & Identifiers:** Snake_case for database entities; enumerated fields use native PostgreSQL ENUMs or CHECK constraints.
6. **Integrity Guarantees:** Foreign keys use `ON DELETE CASCADE` for parent-child containment (e.g., deleting a Document cascades to its Versions and Facts) and `ON DELETE RESTRICT` for cross-entity references (e.g., cannot delete a Commitment that is active in a SimulationRun).

---

## 2. PostgreSQL Physical DDL Specification

```sql
-- AFTERMATH Database Schema
-- Target: PostgreSQL 16+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS & WORKSPACES
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'en-US',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workspaces_owner ON workspaces(owner_user_id);

CREATE TABLE privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    local_processing_only BOOLEAN NOT NULL DEFAULT FALSE,
    mask_pii_before_llm BOOLEAN NOT NULL DEFAULT TRUE,
    retention_days INTEGER NOT NULL DEFAULT 365,
    allow_telemetry BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. DOCUMENTS & VERSIONS
-- ============================================================================

CREATE TYPE document_domain_enum AS ENUM (
    'RESIDENTIAL_TENANCY',
    'EMPLOYMENT',
    'FREELANCE_SERVICES',
    'HIGHER_EDUCATION',
    'SOFTWARE_SUBSCRIPTION',
    'FINANCIAL_DEBT',
    'EQUIPMENT_PURCHASE',
    'INSURANCE_POLICY',
    'COMMERCIAL_LEASING',
    'PARTNERSHIP_BUSINESS',
    'OTHER'
);

CREATE TYPE doc_process_status_enum AS ENUM (
    'UPLOADED',
    'PROCESSING',
    'PROCESSED',
    'FAILED'
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    domain_category document_domain_enum NOT NULL DEFAULT 'OTHER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_workspace ON documents(workspace_id);

CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash CHAR(64) NOT NULL,
    storage_path VARCHAR(1024) NOT NULL,
    processing_status doc_process_status_enum NOT NULL DEFAULT 'UPLOADED',
    error_message TEXT,
    page_count INTEGER,
    source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_document_version UNIQUE (document_id, version_number)
);

CREATE INDEX idx_document_versions_hash ON document_versions(sha256_hash);
CREATE INDEX idx_document_versions_status ON document_versions(processing_status);

-- ============================================================================
-- 3. AI MODELS & EVALUATION
-- ============================================================================

CREATE TYPE model_provider_enum AS ENUM (
    'LOCAL_ONNX',
    'GOOGLE_GEMINI',
    'ANTHROPIC',
    'OPENAI'
);

CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider model_provider_enum NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    parameters_hash VARCHAR(64) NOT NULL,
    prompt_template_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ai_model UNIQUE (provider, model_name, prompt_template_version)
);

CREATE TABLE evaluation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE RESTRICT,
    dataset_name VARCHAR(100) NOT NULL,
    total_samples INTEGER NOT NULL,
    exact_match_score NUMERIC(5, 4) NOT NULL,
    precision_score NUMERIC(5, 4) NOT NULL,
    recall_score NUMERIC(5, 4) NOT NULL,
    hallucination_count INTEGER NOT NULL DEFAULT 0,
    metrics_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    run_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. EXTRACTED FACTS & EVIDENCE
-- ============================================================================

CREATE TYPE epistemic_tier_enum AS ENUM (
    'SOURCE_FACT',
    'EXTRACTED_FACT',
    'DETERMINISTIC_INFERENCE',
    'SCENARIO_ASSUMPTION',
    'AI_INTERPRETATION',
    'EPISTEMIC_UNCERTAINTY'
);

CREATE TYPE verification_status_enum AS ENUM (
    'UNVERIFIED',
    'VERIFIED',
    'EDITED',
    'REJECTED'
);

CREATE TABLE extracted_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    fact_key VARCHAR(100) NOT NULL,
    raw_value TEXT NOT NULL,
    normalized_value JSONB NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    epistemic_tier epistemic_tier_enum NOT NULL DEFAULT 'EXTRACTED_FACT',
    confidence_score NUMERIC(4, 3) NOT NULL,
    extraction_method VARCHAR(50) NOT NULL,
    verification_status verification_status_enum NOT NULL DEFAULT 'UNVERIFIED',
    verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facts_doc_ver ON extracted_facts(document_version_id);
CREATE INDEX idx_facts_status ON extracted_facts(verification_status);
CREATE INDEX idx_facts_key ON extracted_facts(fact_key);
CREATE INDEX idx_facts_normalized_gin ON extracted_facts USING gin(normalized_value);

CREATE TABLE evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extracted_fact_id UUID NOT NULL REFERENCES extracted_facts(id) ON DELETE CASCADE,
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    char_start INTEGER NOT NULL,
    char_end INTEGER NOT NULL,
    bounding_box JSONB, -- {x0: num, y0: num, x1: num, y1: num}
    verbatim_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_fact ON evidence_records(extracted_fact_id);
CREATE INDEX idx_evidence_doc ON evidence_records(document_version_id, page_number);

-- ============================================================================
-- 5. COMMITMENT GRAPH
-- ============================================================================

CREATE TYPE commitment_status_enum AS ENUM (
    'DRAFT',
    'ACTIVE',
    'FULFILLED',
    'TERMINATED',
    'SUPERSEDED',
    'BREACHED'
);

CREATE TABLE commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    origin_document_version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    counterparty_name VARCHAR(255) NOT NULL,
    effective_date DATE,
    expiration_date DATE,
    status commitment_status_enum NOT NULL DEFAULT 'ACTIVE',
    governing_jurisdiction VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commitments_workspace ON commitments(workspace_id);
CREATE INDEX idx_commitments_status ON commitments(status);

CREATE TYPE duty_bearer_enum AS ENUM ('SELF', 'COUNTERPARTY', 'THIRD_PARTY');
CREATE TYPE obligation_modality_enum AS ENUM ('MANDATORY', 'PROHIBITED', 'OPTIONAL');

CREATE TABLE obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    duty_bearer duty_bearer_enum NOT NULL DEFAULT 'SELF',
    modality obligation_modality_enum NOT NULL DEFAULT 'MANDATORY',
    description TEXT NOT NULL,
    trigger_event TEXT,
    remedy_on_breach TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_obligations_commitment ON obligations(commitment_id);

CREATE TABLE conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    expression_logic TEXT NOT NULL,
    is_satisfied BOOLEAN NOT NULL DEFAULT FALSE,
    evaluation_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    obligation_id UUID REFERENCES obligations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline_type VARCHAR(50) NOT NULL,
    target_timestamp TIMESTAMPTZ,
    relative_offset_days INTEGER,
    relative_to_event VARCHAR(100),
    criticality VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deadlines_target ON deadlines(target_timestamp);

CREATE TABLE financial_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    obligation_id UUID REFERENCES obligations(id) ON DELETE CASCADE,
    term_type VARCHAR(50) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    frequency VARCHAR(30) NOT NULL DEFAULT 'ONE_TIME',
    escalation_rate_pct NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financial_commitment ON financial_terms(commitment_id);

CREATE TYPE dependency_type_enum AS ENUM (
    'PREREQUISITE',
    'CAUSAL_CONSEQUENCE',
    'SUPERSEDES',
    'RESTRICTED_BY'
);

CREATE TABLE dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source_entity_type VARCHAR(50) NOT NULL,
    source_entity_id UUID NOT NULL,
    target_entity_type VARCHAR(50) NOT NULL,
    target_entity_id UUID NOT NULL,
    dependency_type dependency_type_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dependency_edge UNIQUE (source_entity_type, source_entity_id, target_entity_type, target_entity_id, dependency_type)
);

CREATE INDEX idx_dependencies_source ON dependencies(source_entity_id);
CREATE INDEX idx_dependencies_target ON dependencies(target_entity_id);

CREATE TABLE conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    commitment_a_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    commitment_b_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'WARNING',
    resolution_status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    explanation_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conflicts_workspace ON conflicts(workspace_id);

-- ============================================================================
-- 6. SCENARIOS & SIMULATION RUNS
-- ============================================================================

CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scenarios_workspace ON scenarios(workspace_id);
CREATE INDEX idx_scenarios_vars_gin ON scenarios USING gin(variables);

CREATE TABLE simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_duration_ms INTEGER NOT NULL,
    engine_version VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    outcomes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    explanation_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sim_runs_scenario ON simulation_runs(scenario_id);
CREATE INDEX idx_sim_runs_outcomes_gin ON simulation_runs USING gin(outcomes_json);
```

---

## 3. High-Performance Query Patterns

### 3.1 Recursive Traversal of Commitment Dependency Graph
To evaluate downstream impact across chained commitments (e.g., finding every commitment and obligation triggered if a master agreement is terminated):

```sql
WITH RECURSIVE consequence_chain AS (
    -- Anchor: Selected root commitment
    SELECT 
        d.id AS dependency_id,
        d.source_entity_id,
        d.target_entity_id,
        d.dependency_type,
        1 AS depth,
        ARRAY[d.source_entity_id] AS path_visited
    FROM dependencies d
    WHERE d.source_entity_id = :root_commitment_id

    UNION ALL

    -- Recursive Step: Trace downstream dependencies
    SELECT 
        child.id,
        child.source_entity_id,
        child.target_entity_id,
        child.dependency_type,
        cc.depth + 1,
        cc.path_visited || child.source_entity_id
    FROM dependencies child
    JOIN consequence_chain cc 
      ON child.source_entity_id = cc.target_entity_id
    WHERE NOT (child.source_entity_id = ANY(cc.path_visited)) -- Cycle protection
      AND cc.depth < 10                                       -- Guard against runaway depth
)
SELECT * FROM consequence_chain;
```

---

## 4. Alembic Migration Strategy

1. **Migration Isolation:** Every migration script must be reversible (`upgrade()` and `downgrade()` strictly implemented).
2. **Zero Downtime Constraint:** Schema additions (new columns, non-unique indexes) must use `CONCURRENTLY` where appropriate in production.
3. **No Dynamic DDL in Application Code:** Table structures are strictly defined via declarative Alembic migrations; never create tables inside service runtime.
