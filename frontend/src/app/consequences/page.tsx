"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  GitFork,
  Check,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ConflictItem {
  id: string;
  conflictType: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  explanation: string;
  involvedCommitments: string[];
  affectedPeriod: string;
  status: "OPEN" | "RESOLVED";
  assertions: {
    fact: string;
    rule: string;
    inference: string;
    assumption: string;
  };
  evidenceQuote?: string;
}

const INITIAL_CONFLICTS: ConflictItem[] = [
  {
    id: "conf-01",
    conflictType: "TEMPORAL_OVERLAP",
    severity: "CRITICAL",
    title: "Concurrent Lease & Studio Sublease Overlap",
    explanation:
      "Both the Springfield Residential Lease and the Chicago Studio Sublease are simultaneously active, creating concurrent occupancy and payment duties.",
    involvedCommitments: [
      "Springfield Residential Lease (2026-11-01 → 2027-10-31)",
      "Chicago Studio Sublease (2027-01-01 → 2027-06-30)",
    ],
    affectedPeriod: "2027-01-01 → 2027-06-30 (6 Months)",
    status: "OPEN",
    assertions: {
      fact: "Springfield Lease effective until 2027-10-31; Chicago Studio commences 2027-01-01.",
      rule: "RULE_TEMPORAL_CONCURRENCY: Concurrent physical commitments incur stacked liabilities unless an explicit sublease/termination rider exists.",
      inference: "User is legally responsible for two simultaneous leases totaling $3,250.00/month.",
      assumption: "User intends to reside at only one location during this 6-month window.",
    },
    evidenceQuote:
      "Commencing on November 1, 2026, and terminating on October 31, 2027.",
  },
  {
    id: "conf-02",
    conflictType: "CANCELLATION_BEFORE_LOCKIN",
    severity: "WARNING",
    title: "Notice Period Window Deficit on Early Resignation",
    explanation:
      "Terminating the Springfield lease prior to month 6 requires 60 days prior written notice plus a full 1-month buyout fee ($2,400.00 USD).",
    involvedCommitments: ["Springfield Residential Lease"],
    affectedPeriod: "Immediate → 2027-04-30",
    status: "OPEN",
    assertions: {
      fact: "Clause 5 requires at least sixty (60) days prior written notice and early buyout fee equal to $2,400.00 USD.",
      rule: "RULE_EARLY_TERMINATION_LIABILITY: Notice delivered without fee deposit constitutes ineffective cancellation.",
      inference: "Attempting to move out on short notice leaves tenant liable for all rent through October 31, 2027.",
      assumption: "Landlord enforces liquidated damages strictly.",
    },
    evidenceQuote:
      "Tenant may terminate this Agreement prior to October 31, 2027, provided Tenant: (a) gives at least sixty (60) days prior written notice, and (b) pays an early termination buyout fee equal to $2,400.00 USD.",
  },
];

export default function ConsequencesPage() {
  const [conflicts, setConflicts] = React.useState<ConflictItem[]>(INITIAL_CONFLICTS);
  const [selectedConflictId, setSelectedConflictId] = React.useState<string>("conf-01");
  const [filterSeverity, setFilterSeverity] = React.useState<string>("ALL");

  const selectedConflict =
    conflicts.find((c) => c.id === selectedConflictId) || conflicts[0];

  const handleResolve = (id: string) => {
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "OPEN" ? "RESOLVED" : "OPEN" }
          : c
      )
    );
  };

  const filteredConflicts =
    filterSeverity === "ALL"
      ? conflicts
      : conflicts.filter((c) => c.severity === filterSeverity);

  return (
    <div className="relative min-h-screen p-8 space-y-6 max-w-7xl mx-auto select-none bg-[#EFECE1]">
      {/* Blueprint Outer Caliper Dimension Stamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D3CDBC] pb-1 mb-2">
        <div className="flex items-center space-x-3">
          <span>DIM // 86.290</span>
          <span>•</span>
          <span>ASSERTION TRACE // DEONTIC</span>
          <span>•</span>
          <span>GRID 8.00mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>CALIPER: 129 mm</span>
          <span>•</span>
          <span className="text-[#DE4A2B] font-bold">100% FACT GROUNDED</span>
          <span>•</span>
          <span>AXIS // 12.260</span>
        </div>
      </div>

      {/* Blueprint Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D3CDBC]">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider mb-1">
            <span>🌱</span>
            <span>MODULE 05.00</span>
            <span>{"//"}</span>
            <span>CONSTRAINT &amp; CONFLICT EXPLORER</span>
            <span className="text-[#DE4A2B]">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414] uppercase">
            Commitment Conflict Explorer
          </h1>
          <p className="text-xs text-[#52524E] mt-0.5">
            Deterministic rule checks detecting temporal overlaps, impossible schedules, notice deficits, and covenant collisions.
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#FFFFFF] p-1 rounded-full border-[1.5px] border-[#1E1E1E] shadow-sm text-xs font-mono">
            {["ALL", "CRITICAL", "WARNING"].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-full transition-all ${
                  filterSeverity === sev
                    ? "bg-[#1E1E1E] text-[#FFFFFF]"
                    : "text-[#52524E] hover:text-[#141414]"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="secondary"
            className="space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]"
            onClick={() => setConflicts(INITIAL_CONFLICTS)}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-evaluate Rules</span>
          </Button>
        </div>
      </div>

      {/* KPI Counters with 42px Bold Numbers & Bottom Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Conflicts (Cobalt Blue #1D64EC) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>TOTAL CONFLICTS EVALUATED</span>
              <span className="text-[#1D64EC]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#1D64EC] leading-tight mt-1 tabular-nums">
              0{conflicts.length}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>0 Arbitrary Scores</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">2 active rules</span>
          </div>
        </div>

        {/* Metric 2: Critical Conflicts (Bold Coral Terracotta #DE4A2B) */}
        <div className="bg-[#FCEAE5] border-[1.5px] border-[#E57368] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#C93B2B] uppercase">
              <span>CRITICAL CONFLICTS</span>
              <span className="text-[#DE4A2B]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#DE4A2B] leading-tight mt-1 tabular-nums">
              0{conflicts.filter((c) => c.severity === "CRITICAL" && c.status === "OPEN").length}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E57368]/40 flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E57368] text-[10px] font-mono text-[#C93B2B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              <span>FAILED • [RETRY REQUIRED]</span>
            </div>
            <span className="text-[10px] font-mono text-[#C93B2B] font-bold">1 OVERLAP</span>
          </div>
        </div>

        {/* Metric 3: Resolved Invariants (Deep Royal Navy #0F4FC2) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>RESOLVED / MITIGATED</span>
              <span className="text-[#0F4FC2]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#0F4FC2] leading-tight mt-1 tabular-nums">
              0{conflicts.filter((c) => c.status === "RESOLVED").length}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FCFAF7] border border-[#D1CCC0] text-[10px] font-mono text-[#141414]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F4FC2]" />
              <span>Human Verified</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">0 pending</span>
          </div>
        </div>
      </div>

      {/* Main Conflict Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Conflict Cards */}
        <div className="lg:col-span-2 space-y-4">
          {filteredConflicts.map((conf) => {
            const isSelected = selectedConflictId === conf.id;
            const isCritical = conf.severity === "CRITICAL";

            return (
              <div
                key={conf.id}
                onClick={() => setSelectedConflictId(conf.id)}
                className={`p-6 rounded-2xl transition-all cursor-pointer shadow-[0_3px_6px_rgba(0,0,0,0.05)] ${
                  isCritical
                    ? "bg-[#FCEAE5] border-[1.5px] border-[#E57368]"
                    : "bg-[#FDF5E6] border-[1.5px] border-[#E6CA85]"
                } ${isSelected ? "ring-2 ring-[#1E1E1E]" : "hover:border-[#1E1E1E]"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        isCritical
                          ? "bg-[#FFFFFF] border-[#E57368] text-[#C93B2B]"
                          : "bg-[#FFFFFF] border-[#E6CA85] text-[#996500]"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-[#141414]">
                          {conf.title}
                        </span>
                        <Badge
                          variant={isCritical ? "error" : "warning"}
                          className="border-[#1E1E1E]"
                        >
                          {conf.severity}
                        </Badge>
                        {conf.status === "RESOLVED" && (
                          <Badge variant="tier-1-source">RESOLVED</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#141414] mt-1.5 leading-relaxed">
                        {conf.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <span className="text-[10px] font-mono text-[#7A7871] block uppercase">
                      AFFECTED HORIZON
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#141414]">
                      {conf.affectedPeriod}
                    </span>
                  </div>
                </div>

                {/* Involved Commitments & Action Button */}
                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                  isCritical ? "border-[#E57368]/40" : "border-[#E6CA85]/40"
                }`}>
                  <div className="flex items-center space-x-2 text-[#7A7871] font-mono text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-[#141414]" />
                    <span>INVOLVED:</span>
                    <span className="text-[#141414] font-sans font-medium">
                      {conf.involvedCommitments.join(" & ")}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolve(conf.id);
                    }}
                    className={`text-[11px] font-mono font-medium px-3 py-1 rounded-full border transition-all ${
                      conf.status === "RESOLVED"
                        ? "bg-[#EAF5EE] text-[#1E6E38] border-[#A7D7B5]"
                        : "bg-[#FFFFFF] text-[#141414] border-[#1E1E1E] hover:bg-[#EFECE1]"
                    }`}
                  >
                    {conf.status === "RESOLVED" ? "Resolved ✓" : "Mark Resolved"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Grounded Conflict Logic Inspector (FACT / RULE / INFERENCE / ASSUMPTION) */}
        <div className="space-y-4">
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] sticky top-6">
            <div className="pb-3 border-b border-[#D1CCC0]">
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider">
                <span>✦</span>
                <span>EPISTEMIC CONFLICT TRACE</span>
              </div>
              <h3 className="text-base font-bold text-[#141414] mt-1 uppercase tracking-tight">
                {selectedConflict.title}
              </h3>
              <span className="text-xs font-mono text-[#DE4A2B] font-semibold">
                Type: {selectedConflict.conflictType} {"//"} DIM 86.290
              </span>
            </div>

            {/* Epistemic Breakdown with Inset Panels */}
            <div className="mt-4 space-y-3 text-xs">
              {/* 1. FACT */}
              <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#1E6E38] uppercase">
                    1. GROUNDED FACT
                  </span>
                  <Badge variant="tier-1-source">VERBATIM</Badge>
                </div>
                <p className="text-[#141414] leading-relaxed">
                  {selectedConflict.assertions.fact}
                </p>
              </div>

              {/* 2. RULE */}
              <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#0F4FC2] uppercase">
                    2. DETERMINISTIC RULE
                  </span>
                  <Badge variant="tier-2-extracted">LOGIC</Badge>
                </div>
                <code className="text-[11px] font-mono text-[#0F4FC2] bg-[#EFF6FF] px-2 py-1 rounded border border-[#BFDBFE] block">
                  {selectedConflict.assertions.rule}
                </code>
              </div>

              {/* 3. INFERENCE (Terracotta) */}
              <div className="p-3.5 bg-[#FCEAE5] rounded-xl border border-[#E57368] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#C93B2B] uppercase">
                    3. FACTUAL INFERENCE
                  </span>
                  <Badge variant="error" className="border-[#E57368]">CONSEQUENCE</Badge>
                </div>
                <p className="text-[#C93B2B] leading-relaxed font-medium">
                  {selectedConflict.assertions.inference}
                </p>
              </div>

              {/* 4. ASSUMPTION (Amber) */}
              <div className="p-3.5 bg-[#FDF5E6] rounded-xl border border-[#E6CA85] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#996500] uppercase">
                    4. USER ASSUMPTION
                  </span>
                  <Badge variant="warning" className="border-[#E6CA85]">UNCERTAINTY</Badge>
                </div>
                <p className="text-[#996500] leading-relaxed">
                  {selectedConflict.assertions.assumption}
                </p>
              </div>

              {/* Verbatim Source Evidence */}
              {selectedConflict.evidenceQuote && (
                <div className="mt-4 pt-3 space-y-1.5 border-t border-[#D1CCC0]">
                  <span className="text-[10px] font-mono text-[#7A7871] uppercase flex items-center justify-between">
                    <span>Source Document Clause</span>
                    <span>🌱</span>
                  </span>
                  <div className="p-3 bg-[#FFFFFF] border border-[#D1CCC0] rounded-xl text-xs text-[#141414] italic leading-relaxed">
                    &ldquo;{selectedConflict.evidenceQuote}&rdquo;
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
