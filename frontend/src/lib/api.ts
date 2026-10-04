const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE}/api/v1`;

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  workspace_id: string;
  title: string;
  domain_category: string;
  created_at: string;
}

export interface CommitmentItem {
  id: string;
  workspace_id: string;
  title: string;
  counterparty_name: string;
  status: string;
  effective_date?: string;
  expiration_date?: string;
  governing_jurisdiction?: string;
  created_at: string;
}

export interface ScenarioItem {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  variables: Array<Record<string, unknown>>;
  created_at: string;
}

export async function fetchHealth(): Promise<{ status: string; version: string; phase: string }> {
  try {
    const res = await fetch(`${API_V1}/health`, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    return { status: "local_mock", version: "0.1.0", phase: "Phase 1 — Foundation" };
  }
}

export async function fetchWorkspaces(): Promise<WorkspaceItem[]> {
  try {
    const res = await fetch(`${API_V1}/workspaces`, { next: { revalidate: 10 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchDocuments(workspaceId?: string): Promise<DocumentItem[]> {
  try {
    const headers: Record<string, string> = {};
    if (workspaceId) headers["X-Workspace-Id"] = workspaceId;
    const res = await fetch(`${API_V1}/documents`, { headers, next: { revalidate: 5 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchCommitments(workspaceId?: string): Promise<CommitmentItem[]> {
  try {
    const headers: Record<string, string> = {};
    if (workspaceId) headers["X-Workspace-Id"] = workspaceId;
    const res = await fetch(`${API_V1}/commitments`, { headers, next: { revalidate: 5 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchScenarios(workspaceId?: string): Promise<ScenarioItem[]> {
  try {
    const headers: Record<string, string> = {};
    if (workspaceId) headers["X-Workspace-Id"] = workspaceId;
    const res = await fetch(`${API_V1}/scenarios`, { headers, next: { revalidate: 5 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
