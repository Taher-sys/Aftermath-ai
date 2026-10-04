"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sliders,
  Plus,
  Play,
  Sparkles,
  GitFork,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ScenarioBranch {
  id: string;
  name: string;
  exitDate: string;
  noticeDays: number;
  label: string;
  description: string;
  netFinancialDelta: number;
  derivedConsequences: {
    title: string;
    amount?: number;
    explanation: string;
    clause: string;
    isBenefit?: boolean;
  }[];
  uncertainConsequences: {
    title: string;
    explanation: string;
    clause: string;
  }[];
}

const BRANCHES: ScenarioBranch[] = [
  {
    id: "branch-a",
    name: "Branch A: Compliant Early Exit",
    exitDate: "2027-03-31",
    noticeDays: 60,
    label: "Exit March 31 with Full 60-Day Notice",
    description: "Delivers written notice on Jan 30, 2027 and pays 1-month liquidated buyout fee ($2,400).",
    netFinancialDelta: 14400.0, // Saved 7 months rent ($16,800) minus $2,400 buyout fee
    derivedConsequences: [
      {
        title: "Saved Future Rent (7 Months @ $2,400)",
        amount: 16800.0,
        explanation: "Terminates recurring rent obligations from April 1, 2027 through October 31, 2027.",
        clause: "Clause 3: Tenant agrees to pay Landlord monthly base rent of $2,400.00 USD.",
        isBenefit: true,
      },
      {
        title: "Mandatory Early Buyout Fee",
        amount: -2400.0,
        explanation: "Liquidated fee equal to one month's rent due upon notice execution.",
        clause: "Clause 5(b): pays an early termination buyout fee equal to $2,400.00 USD.",
        isBenefit: false,
      },
      {
        title: "Full Security Deposit Return ($2,400.00)",
        amount: 2400.0,
        explanation: "Full notice window satisfied; deposit returned in full pending physical walk-through.",
        clause: "Clause 4: Security deposit faithfully returned within statutory period.",
        isBenefit: true,
      },
    ],
    uncertainConsequences: [
      {
        title: "Statutory Re-rental Mitigation Credit",
        explanation: "If Landlord re-leases premises before April 30, tenant may be refunded pro-rata portions under Illinois statutory mitigation rules.",
        clause: "Clause 8: Governing Law (State of Illinois).",
      },
    ],
  },
  {
    id: "branch-b",
    name: "Branch B: Abrupt Exit (Notice Deficit)",
    exitDate: "2027-01-31",
    noticeDays: 15,
    label: "Exit Jan 31 with Only 15-Day Notice",
    description: "Abrupt departure with 45-day notice deficit. Forfeits deposit and remains liable for ongoing rent.",
    netFinancialDelta: 4800.0, // Saved 9 mos ($21,600) minus buyout fee ($2,400), minus deposit forfeiture ($2,400), minus ongoing 5-mo rent dispute ($12,000)
    derivedConsequences: [
      {
        title: "Security Deposit Forfeiture",
        amount: -2400.0,
        explanation: "Tenant fails 60-day notice prerequisite. Landlord retains full $2,400 deposit as damages.",
        clause: "Clause 5(a): gives at least sixty (60) days prior written notice.",
        isBenefit: false,
      },
      {
        title: "Early Termination Buyout Fee",
        amount: -2400.0,
        explanation: "Mandatory contractual early termination fee still legally enforceable.",
        clause: "Clause 5(b): early termination buyout fee equal to $2,400.00 USD.",
        isBenefit: false,
      },
      {
        title: "Ongoing Rent Liability Dispute",
        amount: -12000.0,
        explanation: "Deficient notice permits Landlord to pursue rent through normal expiration until premises re-let.",
        clause: "Clause 2: Term terminating on October 31, 2027.",
        isBenefit: false,
      },
      {
        title: "Unspent Direct Rent",
        amount: 21600.0,
        explanation: "Gross baseline rent scheduled for Feb through Oct 2027.",
        clause: "Clause 3: Base rent of $2,400.00 USD/mo.",
        isBenefit: true,
      },
    ],
    uncertainConsequences: [
      {
        title: "Uncertain Litigation / Collection Proceedings",
        explanation: "High probability of collection referral or small claims suit for unpaid rent balance.",
        clause: "Common Law Tenant Breach Liability.",
      },
    ],
  },
];

export default function ScenariosPage() {
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("branch-a");
  const [activeTab, setActiveTab] = React.useState<"decision" | "diff" | "assumptions">("decision");

  const currentBranch = BRANCHES.find((b) => b.id === selectedBranchId) || BRANCHES[0];

  return (
    <div className="relative min-h-screen p-8 space-y-6 max-w-7xl mx-auto select-none bg-[#EFECE1]">
      {/* Blueprint Outer Caliper Dimension Stamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D3CDBC] pb-1 mb-2">
        <div className="flex items-center space-x-3">
          <span>DIM // 129 mm</span>
          <span>•</span>
          <span>DISCRETE SIM // BITWISE REPRODUCIBLE</span>
          <span>•</span>
          <span>GRID 8.00mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>CALIPER: 86.290</span>
          <span>•</span>
          <span className="text-[#1D64EC] font-bold">BRANCH A/B ACTIVE</span>
          <span>•</span>
          <span>AXIS // 38.300</span>
        </div>
      </div>

      {/* Blueprint Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D3CDBC]">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider mb-1">
            <span>🌱</span>
            <span>MODULE 06.00</span>
            <span>{"//"}</span>
            <span>DISCRETE-EVENT COUNTERFACTUAL SIMULATOR</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414] uppercase">
            What-If Scenario Decision Space
          </h1>
          <p className="text-xs text-[#52524E] mt-0.5">
            Perturb contractual assumptions, fork scenario branches, and observe exact mathematical liability cascades.
          </p>
        </div>

        {/* View Mode Pills */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#FFFFFF] p-1 rounded-full border-[1.5px] border-[#1E1E1E] shadow-sm text-xs font-mono">
            <button
              onClick={() => setActiveTab("decision")}
              className={`px-3 py-1 rounded-full transition-all ${
                activeTab === "decision"
                  ? "bg-[#1E1E1E] text-[#FFFFFF]"
                  : "text-[#52524E] hover:text-[#141414]"
              }`}
            >
              Decision Fork
            </button>
            <button
              onClick={() => setActiveTab("diff")}
              className={`px-3 py-1 rounded-full transition-all ${
                activeTab === "diff"
                  ? "bg-[#1E1E1E] text-[#FFFFFF]"
                  : "text-[#52524E] hover:text-[#141414]"
              }`}
            >
              Before / After Diff
            </button>
          </div>

          <Button size="sm" variant="pill" className="space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]">
            <Plus className="w-3.5 h-3.5" />
            <span>Fork New Branch</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
            <span>ACTIVE COUNTERFACTUAL BRANCHES</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>
          <div className="text-[42px] font-bold font-mono text-[#1D64EC] leading-tight mt-1 tabular-nums">
            02
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>Bitwise Reproducible</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">Branch A &amp; B</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
            <span>BEST NET CASH DELTA</span>
            <span className="text-[#0F4FC2]">✦</span>
          </div>
          <div className="text-[42px] font-bold font-mono text-[#0F4FC2] leading-tight mt-1 tabular-nums">
            +$14,400
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>Compliant Early Exit</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">Branch A</span>
          </div>
        </div>

        <div className="bg-[#FCEAE5] border-[1.5px] border-[#E57368] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#C93B2B] uppercase">
            <span>DEFICIT PENALTY EXPOSURE</span>
            <span className="text-[#DE4A2B]">✦</span>
          </div>
          <div className="text-[42px] font-bold font-mono text-[#DE4A2B] leading-tight mt-1 tabular-nums">
            -$9,600
          </div>
          <div className="mt-3 pt-3 border-t border-[#E57368]/40 flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E57368] text-[10px] font-mono text-[#C93B2B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              <span>FAILED • [RETRY REQUIRED]</span>
            </div>
            <span className="text-[10px] font-mono text-[#C93B2B] font-bold">Branch B</span>
          </div>
        </div>
      </div>

      {/* Visual Scenario Forking Tree Canvas */}
      <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 space-y-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#D1CCC0]">
          <div className="flex items-center space-x-2">
            <GitFork className="w-4 h-4 text-[#141414]" />
            <span className="font-bold text-sm text-[#141414] uppercase tracking-tight">Decision Branch Topology</span>
            <Badge variant="outline" className="border-[#1E1E1E]">DISCRETE SIMULATION ENGINE v0.7</Badge>
          </div>
          <span className="text-[11px] font-mono text-[#7A7871]">
            BITWISE REPRODUCIBLE // ZERO HALLUCINATION // DIM 100
          </span>
        </div>

        {/* Forking Diagram: Root -> Fork -> Branches */}
        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          {/* Baseline Node */}
          <div className="p-5 bg-[#FFFFFF] rounded-2xl border-[1.5px] border-[#1E1E1E] shadow-sm text-center w-84">
            <span className="text-[10px] font-mono bg-[#1E1E1E] text-white px-2.5 py-0.5 rounded-full">
              CURRENT BASELINE
            </span>
            <h4 className="font-bold text-sm text-[#141414] mt-2 uppercase">Full Term Lease (Oct 31, 2027)</h4>
            <p className="text-xs text-[#52524E] mt-1">
              Scheduled Rent: $28,800.00 Total · No Buyout Penalty
            </p>
          </div>

          {/* Fork Arrow */}
          <div className="flex items-center space-x-2 text-xs font-mono text-[#7A7871]">
            <span>↓ PERTURBATION: &ldquo;What if I leave early?&rdquo; ↓</span>
          </div>

          {/* Child Branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {BRANCHES.map((b) => {
              const isSelected = selectedBranchId === b.id;
              const isPositive = b.netFinancialDelta > 0;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  className={`p-5 rounded-2xl transition-all cursor-pointer shadow-[0_3px_6px_rgba(0,0,0,0.05)] ${
                    isSelected
                      ? "bg-[#FFFFFF] border-2 border-[#1E1E1E] ring-2 ring-[#1E1E1E]"
                      : "bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E]/60 hover:border-[#1E1E1E]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#1D64EC] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-full">
                        {b.name}
                      </span>
                      <h3 className="font-bold text-sm text-[#141414] mt-2 uppercase tracking-tight">{b.label}</h3>
                      <p className="text-xs text-[#52524E] mt-1 leading-relaxed">
                        {b.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="text-[10px] font-mono text-[#7A7871] block uppercase">NET DELTA</span>
                      <span
                        className={`text-lg font-bold font-mono tabular-nums ${
                          isPositive ? "text-[#1E6E38]" : "text-[#DE4A2B]"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        ${b.netFinancialDelta.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Epistemic Breakdown of Selected Branch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Consequence Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#D1CCC0]">
              <div>
                <h3 className="text-sm font-bold text-[#141414] uppercase tracking-tight">
                  Derived Consequences for {currentBranch.name}
                </h3>
                <p className="text-xs text-[#52524E]">
                  Mathematically grounded outcomes linking exact contract clauses to financial balances.
                </p>
              </div>
              <Badge variant="tier-1-source" className="border-[#1E1E1E]">100% CLAUSE GROUNDED</Badge>
            </div>

            {/* Derived Consequences List */}
            <div className="mt-4 space-y-3">
              {currentBranch.derivedConsequences.map((c, i) => (
                <div
                  key={i}
                  className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] space-y-2 text-xs shadow-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#141414]">{c.title}</span>
                    {c.amount !== undefined && (
                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          c.amount >= 0 ? "text-[#1E6E38]" : "text-[#DE4A2B]"
                        }`}
                      >
                        {c.amount >= 0 ? "+" : ""}
                        ${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                      </span>
                    )}
                  </div>
                  <p className="text-[#52524E] leading-relaxed">{c.explanation}</p>
                  <div className="pt-2 border-t border-[#D1CCC0] text-[11px] font-mono text-[#0F4FC2]">
                    Grounded Clause: <span className="font-sans text-[#141414] italic">&ldquo;{c.clause}&rdquo;</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Uncertain Consequences Section */}
            {currentBranch.uncertainConsequences.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#D1CCC0] space-y-3">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-[#996500] uppercase tracking-wider font-bold">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>UNCERTAIN CONSEQUENCES (REQUIRES EXTRINSIC FACT)</span>
                </div>
                {currentBranch.uncertainConsequences.map((u, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FDF5E6] rounded-xl border border-[#E6CA85] text-xs space-y-1"
                  >
                    <span className="font-semibold text-[#996500] block">{u.title}</span>
                    <p className="text-[#141414] leading-relaxed">{u.explanation}</p>
                    <span className="text-[10px] font-mono text-[#7A7871] block">
                      Authority: {u.clause}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Scenario Assumption Inspector */}
        <div className="space-y-4">
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] sticky top-6">
            <div className="pb-3 border-b border-[#D1CCC0]">
              <div className="flex items-center space-x-1 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider">
                <span>✦</span>
                <span>SCENARIO TELEMETRY</span>
              </div>
              <h3 className="text-base font-bold text-[#141414] mt-1 uppercase tracking-tight">
                Net Financial Impact
              </h3>
              <div className="text-[42px] font-bold font-mono text-[#1E6E38] leading-tight mt-1 tabular-nums">
                +${currentBranch.netFinancialDelta.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] space-y-1">
                <span className="text-[10px] font-mono text-[#7A7871] uppercase block">
                  KNOWN FACTS (BASELINE)
                </span>
                <p className="text-[#141414]">
                  Lease runs Nov 1, 2026 → Oct 31, 2027 at $2,400.00/month.
                </p>
              </div>

              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] space-y-1">
                <span className="text-[10px] font-mono text-[#0F4FC2] uppercase block">
                  CHANGED ASSUMPTIONS
                </span>
                <p className="text-[#141414]">
                  Departure date set to <strong>{currentBranch.exitDate}</strong> with{" "}
                  <strong>{currentBranch.noticeDays} days</strong> prior written notice.
                </p>
              </div>

              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] space-y-1">
                <span className="text-[10px] font-mono text-[#7A7871] uppercase block">
                  REPRODUCIBILITY HASH
                </span>
                <code className="text-[10px] font-mono text-[#52524E] bg-[#EDE9DD] px-1 py-0.5 rounded border border-[#D1CCC0] block">
                  SIM-7F2A09B4-3-{currentBranch.id}
                </code>
              </div>

              <div className="pt-2">
                <Link href="/evidence">
                  <Button size="sm" variant="secondary" className="w-full text-xs font-mono border-[1.5px] border-[#1E1E1E]">
                    Audit Evidence Trail
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
