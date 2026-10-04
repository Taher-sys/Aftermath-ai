"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  AlertTriangle,
  GitCommit,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CommitmentData {
  id: string;
  title: string;
  counterparty: string;
  domain: string;
  status: string;
  effectiveDate: string;
  expirationDate: string;
  jurisdiction: string;
  monthlyLiability: number;
  obligations: {
    id: string;
    dutyBearer: string;
    modality: "MANDATORY" | "PROHIBITED" | "OPTIONAL";
    text: string;
    remedy: string;
  }[];
  deadlines: {
    title: string;
    type: string;
    criticality: "HIGH" | "MEDIUM" | "LOW";
  }[];
  conditions: {
    title: string;
    expression: string;
  }[];
}

const SAMPLE_COMMITMENTS: CommitmentData[] = [
  {
    id: "com-01",
    title: "Springfield Residential Lease",
    counterparty: "Oakwood Properties LLC",
    domain: "HOUSING",
    status: "ACTIVE",
    effectiveDate: "2026-11-01",
    expirationDate: "2027-10-31",
    jurisdiction: "State of Illinois",
    monthlyLiability: 2400.0,
    obligations: [
      {
        id: "ob-1",
        dutyBearer: "SELF",
        modality: "MANDATORY",
        text: "Pay monthly base rent of $2,400.00 USD on or before the 1st day of each month.",
        remedy: "Subject to late fee of $100.00 after the 5th day and eviction proceedings.",
      },
      {
        id: "ob-2",
        dutyBearer: "SELF",
        modality: "MANDATORY",
        text: "Deliver at least sixty (60) days prior written notice before early lease termination.",
        remedy: "Immediate forfeiture of security deposit and ongoing rent liability.",
      },
      {
        id: "ob-3",
        dutyBearer: "SELF",
        modality: "MANDATORY",
        text: "Notify landlord within forty-eight (48) hours of any water leakage or plumbing defect.",
        remedy: "Tenant liable for consequential property damages if unreported.",
      },
    ],
    deadlines: [
      { title: "Monthly Rent Due Date", type: "RECURRING_MONTHLY", criticality: "HIGH" },
      { title: "Lease Final Expiration Date", type: "ABSOLUTE_DATE", criticality: "HIGH" },
      { title: "Early Exit Notice Window", type: "RELATIVE_DAYS", criticality: "MEDIUM" },
    ],
    conditions: [
      {
        title: "Early Termination Buyout Right",
        expression: "PriorWrittenNotice >= 60 Days AND BuyoutFee == $2,400.00",
      },
    ],
  },
  {
    id: "com-02",
    title: "Chicago Co-Working & Studio Agreement",
    counterparty: "Metro Living & Work LLC",
    domain: "PROFESSIONAL",
    status: "ACTIVE",
    effectiveDate: "2027-01-01",
    expirationDate: "2027-06-30",
    jurisdiction: "State of Illinois",
    monthlyLiability: 850.0,
    obligations: [
      {
        id: "ob-4",
        dutyBearer: "SELF",
        modality: "MANDATORY",
        text: "Pay studio membership fee of $850.00 USD monthly.",
        remedy: "Card key access revocation after 3 business days.",
      },
      {
        id: "ob-5",
        dutyBearer: "SELF",
        modality: "PROHIBITED",
        text: "Do not assign or sublicense reserved studio space without written consent.",
        remedy: "Immediate termination of studio license.",
      },
    ],
    deadlines: [
      { title: "Studio Access Commencement", type: "ABSOLUTE_DATE", criticality: "HIGH" },
      { title: "30-Day Cancellation Notice", type: "NOTICE_WINDOW", criticality: "MEDIUM" },
    ],
    conditions: [
      {
        title: "Security Deposit Return",
        expression: "KeycardReturned == True AND NoPhysicalDamage == True",
      },
    ],
  },
];

export default function CommitmentsPage() {
  const [viewMode, setViewMode] = React.useState<"ledger" | "map">("ledger");
  const [selectedCommitment, setSelectedCommitment] = React.useState<CommitmentData>(
    SAMPLE_COMMITMENTS[0]
  );
  const [filterDomain, setFilterDomain] = React.useState<string>("ALL");

  const filteredCommitments =
    filterDomain === "ALL"
      ? SAMPLE_COMMITMENTS
      : SAMPLE_COMMITMENTS.filter((c) => c.domain === filterDomain);

  const totalMonthlyLiability = SAMPLE_COMMITMENTS.reduce(
    (acc, curr) => acc + curr.monthlyLiability,
    0
  );

  return (
    <div className="relative min-h-screen p-8 space-y-6 max-w-7xl mx-auto select-none bg-[#EFECE1]">
      {/* Blueprint Outer Caliper Dimension Stamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D3CDBC] pb-1 mb-2">
        <div className="flex items-center space-x-3">
          <span>DIM // 12.260</span>
          <span>•</span>
          <span>AXIS // X:1440 Y:900</span>
          <span>•</span>
          <span>GRID 8.00mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>TOLERANCE ±0.05</span>
          <span>•</span>
          <span className="text-[#1D64EC] font-bold">129 mm</span>
          <span>•</span>
          <span>CALIPER: 100</span>
        </div>
      </div>

      {/* Blueprint Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D3CDBC]">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider mb-1">
            <span>🌱</span>
            <span>MODULE 03.00</span>
            <span>{"//"}</span>
            <span>HUMAN COMMITMENT LEDGER</span>
            <span className="text-[#DE4A2B]">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414] uppercase">
            Commitments &amp; Human Obligations
          </h1>
          <p className="text-xs text-[#52524E] mt-0.5">
            Cryptographically grounded covenants, deontic modalities, payment duties, and exit conditions.
          </p>
        </div>

        {/* Console Controls */}
        <div className="flex items-center space-x-3">
          {/* Domain Filter Pills */}
          <div className="flex items-center bg-[#FFFFFF] p-1 rounded-full border-[1.5px] border-[#1E1E1E] shadow-sm">
            {["ALL", "HOUSING", "PROFESSIONAL"].map((dom) => (
              <button
                key={dom}
                onClick={() => setFilterDomain(dom)}
                className={`text-[11px] font-mono font-medium px-3 py-1 rounded-full transition-all ${
                  filterDomain === dom
                    ? "bg-[#1E1E1E] text-[#FFFFFF]"
                    : "text-[#52524E] hover:text-[#141414]"
                }`}
              >
                {dom}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#FFFFFF] p-1 rounded-full border-[1.5px] border-[#1E1E1E] shadow-sm">
            <button
              onClick={() => setViewMode("ledger")}
              className={`text-xs font-mono font-medium px-3 py-1 rounded-full transition-all ${
                viewMode === "ledger"
                  ? "bg-[#1E1E1E] text-[#FFFFFF]"
                  : "text-[#52524E] hover:text-[#141414]"
              }`}
            >
              Table Ledger
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`text-xs font-mono font-medium px-3 py-1 rounded-full transition-all ${
                viewMode === "map"
                  ? "bg-[#1E1E1E] text-[#FFFFFF]"
                  : "text-[#52524E] hover:text-[#141414]"
              }`}
            >
              Commitment Map
            </button>
          </div>

          <Link href="/timeline">
            <Button size="sm" variant="pill" className="space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Project on Timeline</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Console with Exact Colors & Bottom Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Units (Cobalt Blue #1D64EC) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase tracking-wider">
              <span>ACTIVE COMMITMENTS</span>
              <span className="text-[#1D64EC]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#1D64EC] leading-tight mt-1 tabular-nums">
              0{SAMPLE_COMMITMENTS.length}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>100% Covenants Verified</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">2 units</span>
          </div>
        </div>

        {/* Metric 2: Total Covenants (Royal Navy #0F4FC2) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase tracking-wider">
              <span>TOTAL OBLIGATIONS</span>
              <span className="text-[#0F4FC2]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#0F4FC2] leading-tight mt-1 tabular-nums">
              0{SAMPLE_COMMITMENTS.reduce((acc, c) => acc + c.obligations.length, 0)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FCFAF7] border border-[#D1CCC0] text-[10px] font-mono text-[#141414]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F4FC2]" />
              <span>5 Mandatory · 1 Prohibitive</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">5 covenants</span>
          </div>
        </div>

        {/* Metric 3: Monthly Cash Liability (Charcoal Ink #141414 + Dual Telemetry Bars) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase tracking-wider">
              <span>MONTHLY CASH LIABILITY</span>
              <span>🌱</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#141414] leading-tight mt-1 tabular-nums">
              ${totalMonthlyLiability.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] space-y-1.5">
            {/* Dual Progress Indicator Bars */}
            <div className="flex items-center space-x-1 h-1.5 w-full bg-[#EDE9DD] rounded-full overflow-hidden">
              <div className="h-full bg-[#2BB673]" style={{ width: "74%" }} />
              <div className="h-full bg-[#E54837]" style={{ width: "26%" }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#52524E]">
              <span>Base: $2,400 (74%)</span>
              <span className="text-[#DE4A2B]">Studio: $850 (26%)</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Critical Conflicts (Bold Coral Terracotta #DE4A2B) */}
        <div className="bg-[#FCEAE5] border-[1.5px] border-[#E57368] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#C93B2B] uppercase tracking-wider">
              <span>DETECTED CONFLICTS</span>
              <span className="text-[#DE4A2B]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#DE4A2B] leading-tight mt-1 tabular-nums">
              01
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E57368]/40 flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E57368] text-[10px] font-mono text-[#C93B2B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              <span>Temporal overlap active</span>
            </div>
            <span className="text-[10px] font-mono text-[#C93B2B] font-bold">CRITICAL</span>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      {viewMode === "ledger" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Commitment Cards */}
          <div className="lg:col-span-2 space-y-4">
            {filteredCommitments.map((com) => {
              const isSelected = selectedCommitment.id === com.id;
              return (
                <div
                  key={com.id}
                  onClick={() => setSelectedCommitment(com)}
                  className={`bg-[#FFFFFF] border-[1.5px] rounded-2xl p-6 cursor-pointer transition-all shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] ${
                    isSelected
                      ? "border-[#1E1E1E] ring-2 ring-[#1E1E1E]"
                      : "border-[#1E1E1E] hover:border-[#000000]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">🌱</span>
                        <h2 className="text-base font-bold text-[#141414] uppercase tracking-tight">{com.title}</h2>
                        <Badge variant="outline" className="border-[#1E1E1E]">{com.domain}</Badge>
                        <Badge variant="tier-1-source">{com.status}</Badge>
                      </div>
                      <p className="text-xs text-[#52524E] mt-1 font-mono">
                        Counterparty: <strong className="text-[#141414]">{com.counterparty}</strong> · Governing Law: {com.jurisdiction}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-[#7A7871] font-mono uppercase">RECURRING LIABILITY</div>
                      <div className="text-xl font-bold font-mono text-[#1D64EC] tabular-nums">
                        ${com.monthlyLiability.toLocaleString(undefined, { minimumFractionDigits: 2 })} / mo
                      </div>
                    </div>
                  </div>

                  {/* Horizon Calipers */}
                  <div className="mt-4 pt-3 border-t border-[#D1CCC0] flex items-center justify-between text-xs font-mono text-[#52524E]">
                    <span>COMMENCEMENT: <strong className="text-[#141414]">{com.effectiveDate}</strong></span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#1E1E1E]" />
                    <span>FINAL EXPIRATION: <strong className="text-[#141414]">{com.expirationDate}</strong></span>
                  </div>

                  {/* Obligations Inset Snippets */}
                  <div className="mt-4 space-y-2">
                    <div className="text-[10px] font-mono text-[#7A7871] uppercase tracking-wider flex items-center space-x-1">
                      <span>PRIMARY COVENANTS ({com.obligations.length})</span>
                      <span className="text-[#1D64EC]">✦</span>
                    </div>
                    {com.obligations.slice(0, 2).map((ob) => (
                      <div
                        key={ob.id}
                        className="p-3 rounded-xl bg-[#FCFAF7] border border-[#D1CCC0] text-xs text-[#141414] flex items-start space-x-2"
                      >
                        <Badge
                          variant={ob.modality === "PROHIBITED" ? "error" : "default"}
                          className="shrink-0 text-[9px] py-0 border-[#1E1E1E]"
                        >
                          {ob.modality}
                        </Badge>
                        <span className="leading-snug">{ob.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep Commitment Inspector */}
          <div className="space-y-4">
            <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] sticky top-6">
              <div className="pb-3 border-b border-[#D1CCC0]">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider">
                  <span>✦</span>
                  <span>COMMITMENT SPECIFICATION</span>
                </div>
                <h3 className="text-base font-bold text-[#141414] mt-1 uppercase tracking-tight">
                  {selectedCommitment.title}
                </h3>
                <span className="text-xs font-mono text-[#52524E]">ID: {selectedCommitment.id} {"//"} AXIS 86.290</span>
              </div>

              {/* Obligations list */}
              <div className="mt-4 space-y-3">
                <div className="text-[10px] font-mono text-[#7A7871] uppercase tracking-wider flex items-center justify-between">
                  <span>ALL DEONTIC OBLIGATIONS</span>
                  <span>🌱</span>
                </div>
                {selectedCommitment.obligations.map((ob, idx) => (
                  <div key={ob.id} className="p-3 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold text-[#141414]">
                        OBLIGATION #{idx + 1}
                      </span>
                      <Badge variant={ob.modality === "PROHIBITED" ? "error" : "tier-2-extracted"}>
                        {ob.modality}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#141414] leading-relaxed">{ob.text}</p>
                    
                    {/* Remedy styled in terracotta panel */}
                    <div className="p-2.5 bg-[#FCEAE5] border border-[#E57368] rounded-lg text-[11px] text-[#C93B2B] leading-snug">
                      <strong>Remedy on Breach:</strong> {ob.remedy}
                    </div>
                  </div>
                ))}
              </div>

              {/* Conditions & Exit Constraints */}
              <div className="mt-6 pt-4 border-t border-[#D1CCC0] space-y-2">
                <div className="text-[10px] font-mono text-[#7A7871] uppercase tracking-wider">
                  CONDITIONAL EXIT GATES
                </div>
                {selectedCommitment.conditions.map((c, i) => (
                  <div key={i} className="p-3 bg-[#EAF5EE] rounded-xl border border-[#A7D7B5] text-xs space-y-1">
                    <span className="font-semibold text-[#1E6E38] block">{c.title}</span>
                    <code className="text-[11px] font-mono text-[#1E6E38] bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#A7D7B5] block">
                      {c.expression}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Commitment Map (Human Relationship Graph) */
        <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 space-y-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#D1CCC0]">
            <div className="flex items-center space-x-2">
              <GitCommit className="w-4 h-4 text-[#141414]" />
              <span className="font-bold text-sm text-[#141414] uppercase tracking-tight">Human Commitment Map (Directed Graph)</span>
              <Badge variant="outline" className="border-[#1E1E1E]">RELATIONSHIPS: creates, requires, depends_on, expires_on</Badge>
            </div>
            <span className="text-[11px] font-mono text-[#7A7871]">
              Rendered over Blueprint Grid // ISO 8601 // 38.300 mm
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Commitment Root */}
            <div className="p-5 bg-[#FFFFFF] rounded-2xl border-[1.5px] border-[#1E1E1E] shadow-sm space-y-2">
              <span className="text-[10px] font-mono bg-[#1E1E1E] text-white px-2 py-0.5 rounded-full">
                ROOT COMMITMENT
              </span>
              <h4 className="font-bold text-sm text-[#141414]">Springfield Residential Lease</h4>
              <p className="text-xs text-[#52524E]">
                Landlord: Oakwood Properties LLC · Effective 2026-11-01
              </p>
              <div className="pt-2 text-xs font-mono text-[#1D64EC] font-bold">
                ↓ creates 3 Obligations
              </div>
            </div>

            {/* Downstream Obligations */}
            <div className="space-y-3">
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] shadow-xs space-y-1">
                <span className="text-[9px] font-mono text-[#1E6E38] bg-[#EAF5EE] border border-[#A7D7B5] px-1.5 py-0.5 rounded">
                  OBLIGATION: creates
                </span>
                <p className="text-xs font-medium text-[#141414]">Pay Base Rent ($2,400.00/mo)</p>
                <div className="text-[10px] font-mono text-[#7A7871]">→ requires Monthly Payment on 1st</div>
              </div>

              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] shadow-xs space-y-1">
                <span className="text-[9px] font-mono text-[#996500] bg-[#FDF5E6] border border-[#E6CA85] px-1.5 py-0.5 rounded">
                  OBLIGATION: requires
                </span>
                <p className="text-xs font-medium text-[#141414]">Notice Period (60 days)</p>
                <div className="text-[10px] font-mono text-[#7A7871]">→ prerequisite for Early Termination</div>
              </div>
            </div>

            {/* Exit Constraints & Conditions */}
            <div className="space-y-3">
              <div className="p-4 bg-[#FCEAE5] rounded-xl border border-[#E57368] shadow-xs space-y-1">
                <span className="text-[9px] font-mono text-[#C93B2B] bg-[#FFFFFF] border border-[#E57368] px-1.5 py-0.5 rounded font-bold">
                  CONFLICT: conflicts_with
                </span>
                <p className="text-xs font-medium text-[#C93B2B]">
                  Overlaps with Chicago Sublease (Jan 2027 – Jun 2027)
                </p>
                <div className="text-[10px] font-mono text-[#C93B2B]">
                  Concurrent liability: $3,250.00 / month
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] shadow-xs space-y-1">
                <span className="text-[9px] font-mono text-[#0F4FC2] bg-[#EFF6FF] border border-[#BFDBFE] px-1.5 py-0.5 rounded">
                  CONDITION: depends_on
                </span>
                <p className="text-xs font-medium text-[#141414]">Early Exit Buyout ($2,400 Fee)</p>
                <div className="text-[10px] font-mono text-[#7A7871]">→ depends_on Notice + Fee Payment</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
