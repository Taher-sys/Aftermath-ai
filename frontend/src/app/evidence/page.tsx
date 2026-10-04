"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Download,
  Search,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface EvidenceRecordItem {
  id: string;
  finding: string;
  category: string;
  documentTitle: string;
  pageNumber: number;
  charStart: number;
  charEnd: number;
  verbatimExcerpt: string;
  epistemicStatus: "VERIFIED" | "UNCERTAIN" | "NEEDS_CONFIRMATION";
  confidenceScore: number;
  calculationRule: string;
  provenanceChain: {
    step: string;
    label: string;
    desc: string;
  }[];
}

const SAMPLE_EVIDENCE: EvidenceRecordItem[] = [
  {
    id: "ev-01",
    finding: "Base Rent: $2,400.00 USD / Monthly",
    category: "FINANCIAL",
    documentTitle: "Standard Residential Lease Agreement",
    pageNumber: 1,
    charStart: 382,
    charEnd: 395,
    verbatimExcerpt: "Tenant agrees to pay Landlord monthly base rent of $2,400.00 USD, due on or before the first day of each month.",
    epistemicStatus: "VERIFIED",
    confidenceScore: 0.98,
    calculationRule: "RULE_MONTHLY_CASH_LIABILITY: RentAmount = 2400.00 USD",
    provenanceChain: [
      { step: "CONCLUSION", label: "Monthly Rent Duty", desc: "User is legally obligated to remit $2,400.00 USD each calendar month." },
      { step: "WHY", label: "Causal Rationale", desc: "Covenant 3 specifies payment on or before the 1st day without deduction or offset." },
      { step: "EVIDENCE", label: "Cryptographic Span", desc: "Page 1, offsets [382:395] in immutable Document Vault blob." },
      { step: "SOURCE", label: "Verbatim Clause", desc: "monthly base rent of $2,400.00 USD" },
      { step: "FACT", label: "Normalized Entity", desc: "FactKey: BASE_RENT | Currency: USD | Frequency: MONTHLY" },
      { step: "RULE", label: "Evaluated Rule", desc: "RULE_PAYMENT_SCHEDULE (Due Day: 1st of month, Grace Period: 5 days)" },
    ],
  },
  {
    id: "ev-02",
    finding: "Early Termination Buyout Fee: $2,400.00 USD",
    category: "EXIT_CONSTRAINT",
    documentTitle: "Standard Residential Lease Agreement",
    pageNumber: 2,
    charStart: 335,
    charEnd: 348,
    verbatimExcerpt: "Tenant may terminate this Agreement prior to October 31, 2027, provided Tenant: (a) gives at least sixty (60) days prior written notice, and (b) pays an early termination buyout fee equal to one (1) month rent ($2,400.00 USD).",
    epistemicStatus: "VERIFIED",
    confidenceScore: 0.94,
    calculationRule: "RULE_EARLY_TERMINATION_LIABILITY: LiquidatedFee = 1 * BaseRentAmount",
    provenanceChain: [
      { step: "CONCLUSION", label: "Early Exit Liability", desc: "Exiting early mandates payment of $2,400.00 USD liquidated buyout fee." },
      { step: "WHY", label: "Contractual Covenant", desc: "Clause 5 grants a conditional exit right subject to notice and payment." },
      { step: "EVIDENCE", label: "Cryptographic Span", desc: "Page 2, offsets [335:348] in immutable Document Vault blob." },
      { step: "SOURCE", label: "Verbatim Clause", desc: "early termination buyout fee equal to one (1) month rent ($2,400.00 USD)" },
      { step: "FACT", label: "Normalized Entity", desc: "FactKey: EARLY_TERMINATION_FEE | Amount: 2400.00 USD | One-Time" },
      { step: "RULE", label: "Evaluated Rule", desc: "RULE_BUYOUT_CONDITIONAL (Requires 60-day written notice concurrently)" },
    ],
  },
  {
    id: "ev-03",
    finding: "Water Leakage 48-Hour Notice Duty",
    category: "DUTY",
    documentTitle: "Standard Residential Lease Agreement",
    pageNumber: 3,
    charStart: 52,
    charEnd: 98,
    verbatimExcerpt: "Tenant shall notify Landlord in writing within forty-eight (48) hours of any water leakage, plumbing malfunction, or structural hazard.",
    epistemicStatus: "VERIFIED",
    confidenceScore: 0.96,
    calculationRule: "RULE_CASUALTY_REPORTING_WINDOW: Window = 48 Hours",
    provenanceChain: [
      { step: "CONCLUSION", label: "Notice Duty", desc: "Tenant must report water defects within 48 hours to avoid consequential damages." },
      { step: "WHY", label: "Property Risk Allocation", desc: "Failure to report shifts repair costs from landlord to tenant." },
      { step: "EVIDENCE", label: "Cryptographic Span", desc: "Page 3, offsets [52:98] in Document Vault blob." },
      { step: "SOURCE", label: "Verbatim Clause", desc: "within forty-eight (48) hours of any water leakage" },
      { step: "FACT", label: "Normalized Entity", desc: "FactKey: NOTICE_PERIOD_LEAK | Duration: 2 calendar days" },
      { step: "RULE", label: "Evaluated Rule", desc: "RULE_BREACH_DAMAGES_SHIFT" },
    ],
  },
  {
    id: "ev-04",
    finding: "Statutory Mitigation Credit on Re-Rental",
    category: "EXTRINSIC_LAW",
    documentTitle: "Illinois Landlord-Tenant Statutory Code",
    pageNumber: 1,
    charStart: 0,
    charEnd: 0,
    verbatimExcerpt: "765 ILCS 705/1: A landlord has a duty to mitigate damages if a tenant defaults or abandons the leased premises.",
    epistemicStatus: "UNCERTAIN",
    confidenceScore: 0.82,
    calculationRule: "RULE_STATUTORY_MITIGATION",
    provenanceChain: [
      { step: "CONCLUSION", label: "Mitigation Credit", desc: "Tenant may be entitled to refund if replacement tenant occupies unit early." },
      { step: "WHY", label: "Extrinsic Statute", desc: "State of Illinois imposes statutory duty on landlord to mitigate damages." },
      { step: "EVIDENCE", label: "Statutory Citation", desc: "765 ILCS 705/1 (Governing Law Illinois)" },
      { step: "SOURCE", label: "Statutory Text", desc: "landlord has a duty to mitigate damages" },
      { step: "FACT", label: "Legal Rule", desc: "Extrinsic legal requirement not explicitly stated in lease text." },
      { step: "RULE", label: "Epistemic Status", desc: "UNCERTAIN — Needs confirmation based on actual re-lease date." },
    ],
  },
];

export default function EvidencePage() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedRecordId, setSelectedRecordId] = React.useState<string>("ev-01");

  const filteredRecords = SAMPLE_EVIDENCE.filter(
    (e) =>
      searchQuery === "" ||
      e.finding.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.verbatimExcerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRecord =
    SAMPLE_EVIDENCE.find((e) => e.id === selectedRecordId) || SAMPLE_EVIDENCE[0];

  return (
    <div className="relative min-h-screen p-8 space-y-6 max-w-7xl mx-auto select-none bg-[#EFECE1]">
      {/* Blueprint Outer Caliper Dimension Stamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D3CDBC] pb-1 mb-2">
        <div className="flex items-center space-x-3">
          <span>DIM // 12.260</span>
          <span>•</span>
          <span>EVIDENCE AUDIT // ZERO DRIFT</span>
          <span>•</span>
          <span>GRID 8.00mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>CALIPER: 129 mm</span>
          <span>•</span>
          <span className="text-[#1D64EC] font-bold">100% TRACEABILITY</span>
          <span>•</span>
          <span>AXIS // 86.290</span>
        </div>
      </div>

      {/* Blueprint Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D3CDBC]">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider mb-1">
            <span>🌱</span>
            <span>MODULE 07.00</span>
            <span>{"//"}</span>
            <span>EVIDENCE VAULT &amp; EXPLAINABILITY</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414] uppercase">
            Evidence &amp; Provenance Audit Vault
          </h1>
          <p className="text-xs text-[#52524E] mt-0.5">
            Every conclusion is inspectable: Conclusion → Why? → Evidence → Source text → Extracted fact → Calculation rule.
          </p>
        </div>

        {/* Console Controls */}
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="pill" className="space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]">
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Dossier (PDF/MD)</span>
          </Button>
        </div>
      </div>

      {/* Audit Telemetry Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Records (Cobalt Blue #1D64EC) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>TOTAL EVIDENCE RECORDS</span>
              <span className="text-[#1D64EC]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#1D64EC] leading-tight mt-1 tabular-nums">
              0{SAMPLE_EVIDENCE.length}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>100% Cryptographic Grounding</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">4 records</span>
          </div>
        </div>

        {/* Metric 2: Verified Clauses (Royal Navy #0F4FC2) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>VERIFIED SPAN CLAUSES</span>
              <span className="text-[#0F4FC2]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#0F4FC2] leading-tight mt-1 tabular-nums">
              03
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FCFAF7] border border-[#D1CCC0] text-[10px] font-mono text-[#141414]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F4FC2]" />
              <span>Zero Offset Drift</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">3 verified</span>
          </div>
        </div>

        {/* Metric 3: System Grounding Ratio (Charcoal Ink #141414 + Dual Progress) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>GROUNDING INTEGRITY</span>
              <span>🌱</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#141414] leading-tight mt-1 tabular-nums">
              100%
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] space-y-1.5">
            <div className="flex items-center space-x-1 h-1.5 w-full bg-[#EDE9DD] rounded-full overflow-hidden">
              <div className="h-full bg-[#2BB673]" style={{ width: "75%" }} />
              <div className="h-full bg-[#E54837]" style={{ width: "25%" }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#52524E]">
              <span>Direct: 75%</span>
              <span className="text-[#DE4A2B]">Extrinsic: 25%</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Uncertain Records (Coral Terracotta #DE4A2B) */}
        <div className="bg-[#FCEAE5] border-[1.5px] border-[#E57368] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#C93B2B] uppercase">
              <span>UNCERTAIN / EXTRINSIC STATUTE</span>
              <span className="text-[#DE4A2B]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#DE4A2B] leading-tight mt-1 tabular-nums">
              01
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E57368]/40 flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E57368] text-[10px] font-mono text-[#C93B2B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              <span>FAILED • [RETRY REQUIRED]</span>
            </div>
            <span className="text-[10px] font-mono text-[#C93B2B] font-bold">1 LAW</span>
          </div>
        </div>
      </div>

      {/* Main Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Evidence Records */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Filter Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A7871] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search evidence records by term, clause, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-xl focus:border-[#1E1E1E] shadow-sm"
            />
          </div>

          {/* Evidence Cards */}
          <div className="space-y-3">
            {filteredRecords.map((ev) => {
              const isSelected = selectedRecordId === ev.id;
              const isUncertain = ev.epistemicStatus === "UNCERTAIN";

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedRecordId(ev.id)}
                  className={`p-5 rounded-2xl border-[1.5px] transition-all cursor-pointer shadow-[0_3px_6px_rgba(0,0,0,0.05)] ${
                    isSelected
                      ? "bg-[#FFFFFF] border-[#1E1E1E] ring-2 ring-[#1E1E1E]"
                      : isUncertain
                      ? "bg-[#FDF5E6] border-[#E6CA85] hover:border-[#1E1E1E]"
                      : "bg-[#FFFFFF] border-[#1E1E1E]/40 hover:border-[#1E1E1E]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#141414]">
                          {ev.finding}
                        </span>
                        <Badge
                          variant={
                            isUncertain
                              ? "warning"
                              : "tier-1-source"
                          }
                          className="border-[#1E1E1E]"
                        >
                          {ev.epistemicStatus}
                        </Badge>
                        <Badge variant="outline" className="border-[#1E1E1E]">{ev.category}</Badge>
                      </div>
                      <p className="text-xs text-[#52524E] mt-1 font-mono">
                        Source Document: <strong>{ev.documentTitle}</strong> · Page {ev.pageNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[#7A7871] block uppercase">CONFIDENCE</span>
                      <span className="text-sm font-mono font-bold text-[#1E6E38] tabular-nums">
                        {Math.round(ev.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Verbatim Excerpt Box */}
                  <div className="mt-3 p-3 bg-[#FCFAF7] border border-[#D1CCC0] rounded-xl text-xs text-[#141414] italic leading-relaxed">
                    &ldquo;{ev.verbatimExcerpt}&rdquo;
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#D1CCC0] flex items-center justify-between text-[11px] font-mono text-[#7A7871]">
                    <span>SPAN OFFSETS: [{ev.charStart}:{ev.charEnd}]</span>
                    <span className="text-[#1D64EC] font-bold">Click to inspect resolution trail →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Provenance Inspector & Source Trace */}
        <div className="space-y-4">
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] sticky top-6">
            <div className="pb-3 border-b border-[#D1CCC0]">
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider">
                <span>✦</span>
                <span>UNBROKEN PROVENANCE TRAIL</span>
              </div>
              <h3 className="text-base font-bold text-[#141414] mt-1 uppercase tracking-tight">
                {selectedRecord.finding}
              </h3>
              <span className="text-xs font-mono text-[#1E6E38] font-bold">
                Status: {selectedRecord.epistemicStatus} {"//"} DIM 12.260
              </span>
            </div>

            {/* Resolution Chain Steps */}
            <div className="mt-4 space-y-3">
              {selectedRecord.provenanceChain.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] text-xs space-y-1 shadow-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#141414] uppercase">
                      {idx + 1}. {step.label}
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 border-[#1E1E1E]">
                      {step.step}
                    </Badge>
                  </div>
                  <p className="text-[#52524E] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-[#D1CCC0] space-y-2">
              <Link href="/documents/doc-sample-01">
                <Button size="sm" variant="secondary" className="w-full text-xs font-mono space-x-1.5 border-[1.5px] border-[#1E1E1E]">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Physical Page in Document Viewer</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
