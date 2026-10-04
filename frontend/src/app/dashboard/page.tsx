"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  GitFork,
  Layers,
  Sparkles,
  ShieldCheck,
  Activity,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto relative select-none">
      {/* Drafting Dimension Calipers Overlay */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] pb-1 border-b border-[#D1CCC0]">
        <div className="flex items-center space-x-4">
          <span>SEC: 01.00 // DRAFTING GRID</span>
          <span className="text-[#D3CDBC]">┼</span>
          <span>CALIPER: 86.290</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>TOLERANCE: ±0.05</span>
          <span className="text-[#D3CDBC]">│</span>
          <span>129 mm</span>
        </div>
      </div>

      {/* Page Title & Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#52524E] uppercase tracking-wider mb-1">
            <span className="text-[#16A34A]">🌱</span>
            <span className="font-bold text-[#141414]">WORKSPACE OVERVIEW</span>
            <span>{"//"}</span>
            <span>ENTERPRISE DEVELOPER CONSOLE</span>
            <span className="text-[#DE4A2B]">✦</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#141414] tracking-tight uppercase">
            Commitment Pipeline & Telemetry
          </h1>
          <p className="text-xs text-[#52524E] mt-1 max-w-2xl leading-relaxed">
            Active contractual commitments, temporal horizons, and deterministic cross-document conflict detection.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/scenarios">
            <Button size="sm" variant="secondary" className="space-x-1.5 border-[1.5px] border-[#2B2B28] rounded-full bg-white hover:bg-[#FAF7F0] text-[#141414] font-bold shadow-xs">
              <GitFork className="w-3.5 h-3.5" />
              <span>Simulate Scenario</span>
            </Button>
          </Link>
          <Link href="/documents">
            <Button size="sm" className="space-x-1.5 rounded-full bg-[#1E1E1E] hover:bg-[#2A2A2A] text-white font-bold shadow-sm px-4">
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Document</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-Column High-Impact KPI Metric Blocks with Reference Styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Active Units / Microservices (Cobalt Blue #1D64EC) */}
        <div className="blueprint-card-tactile bg-white p-6 space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#52524E] uppercase tracking-wider flex items-center space-x-1.5">
              <span>ACTIVE COMMITMENTS</span>
              <span className="text-[#1D64EC]">✦</span>
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1D64EC]">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-[44px] font-extrabold text-[#1D64EC] tracking-tight leading-none tabular-nums">
              8
            </div>
            <p className="text-[11px] text-[#52524E] mt-2 font-medium">
              Verified active legal agreements in primary workspace
            </p>
          </div>

          {/* Sub-Pill Badge */}
          <div className="pt-2 border-t border-[#E3DDD0] flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D64EC] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#1D64EC]" />
              <span>48 tasks active</span>
            </span>
            <span className="text-[10px] font-mono text-[#7A7871]">DIM: 38.300</span>
          </div>
        </div>

        {/* Metric 2: APIs / Verified Horizon (Deep Royal Navy #0F4FC2) */}
        <div className="blueprint-card-tactile bg-white p-6 space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#52524E] uppercase tracking-wider flex items-center space-x-1.5">
              <span>VERIFIED COVENANTS</span>
              <span className="text-[#0F4FC2]">✦</span>
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#0F4FC2]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-[44px] font-extrabold text-[#0F4FC2] tracking-tight leading-none tabular-nums">
              24
            </div>
            <p className="text-[11px] text-[#52524E] mt-2 font-medium">
              Cryptographically grounded obligations and financial covenants
            </p>
          </div>

          {/* Sub-Pill Badge */}
          <div className="pt-2 border-t border-[#E3DDD0] flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#0F4FC2] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#0F4FC2]" />
              <span>24 endpoints verified</span>
            </span>
            <span className="text-[10px] font-mono text-[#7A7871]">SCALE: 100</span>
          </div>
        </div>

        {/* Metric 3: Conflicts / Critical Alerts (Bold Coral Terracotta #DE4A2B) */}
        <div className="blueprint-card-tactile bg-white p-6 space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#52524E] uppercase tracking-wider flex items-center space-x-1.5">
              <span>CONFLICTS & BREACHES</span>
              <span className="text-[#DE4A2B]">✦</span>
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FCEAE5] border border-[#E57368] flex items-center justify-center text-[#DE4A2B]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-[44px] font-extrabold text-[#DE4A2B] tracking-tight leading-none tabular-nums">
              2
            </div>
            <p className="text-[11px] text-[#52524E] mt-2 font-medium">
              Overlapping lease liability & 30-day notice deficiency
            </p>
          </div>

          {/* Sub-Pill Badge */}
          <div className="pt-2 border-t border-[#E3DDD0] flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FCEAE5] border border-[#E57368] text-[#DE4A2B] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#DE4A2B]" />
              <span>11 tasks flagged</span>
            </span>
            <span className="text-[10px] font-mono text-[#DE4A2B] font-bold">CRITICAL</span>
          </div>
        </div>
      </div>

      {/* Telemetry Resource Percentages & Dual Progress Indicators */}
      <div className="blueprint-container-large p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#D1CCC0] pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#141414]" />
            <span className="font-extrabold text-xs font-mono uppercase tracking-wider text-[#141414]">
              SYSTEM TELEMETRY & RUNTIME INTEGRITY
            </span>
            <span className="text-[#16A34A]">🌱</span>
          </div>
          <span className="text-xs font-mono text-[#7A7871]">ISO 8601 UTC // SAMPLING INTERVAL: 50ms</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Dual Progress Meter 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#141414]">Grounding Verification Ratio</span>
              <span className="text-[#2BB673] tabular-nums">98.6% NOMINAL</span>
            </div>
            {/* Dual Progress Bar */}
            <div className="h-3 w-full bg-[#EFECE1] border border-[#D1CCC0] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#2BB673]" style={{ width: "98.6%" }} />
              <div className="h-full bg-[#E54837]" style={{ width: "1.4%" }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871]">
              <span>Verified: 24 Covenants</span>
              <span className="text-[#E54837]">0.0% Hallucinations</span>
            </div>
          </div>

          {/* Dual Progress Meter 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#141414]">Temporal Horizon Coverage (365d)</span>
              <span className="text-[#1D64EC] tabular-nums">82.4% ACTIVE</span>
            </div>
            {/* Dual Progress Bar */}
            <div className="h-3 w-full bg-[#EFECE1] border border-[#D1CCC0] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#1D64EC]" style={{ width: "82.4%" }} />
              <div className="h-full bg-[#D1CCC0]" style={{ width: "17.6%" }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871]">
              <span>Next Renewal: 212 Days</span>
              <span>Buffer: 60 Days Notice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Pipeline Feed Table with Circular Status Dots and Retry Badges */}
      <div className="blueprint-container-large overflow-hidden">
        <div className="p-5 border-b-2 border-[#2B2B28] bg-[#FDFCF7] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase font-mono tracking-wider text-[#141414]">
                PROJECT PIPELINE // COMMITMENT DOCUMENTS
              </span>
              <span className="text-[10px] text-[#16A34A]">🌱</span>
            </div>
            <p className="text-xs text-[#52524E]">
              Real-time document verification queue, extraction status, and integrity audits.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white border border-[#2B2B28] font-bold">
            3 CONTRACTS QUEUED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D1CCC0] bg-[#FAF7F0] text-[#52524E] font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Counterparty</th>
                <th className="py-3 px-4">Effective Dates</th>
                <th className="py-3 px-4 text-right">Base Liability</th>
                <th className="py-3 px-4 text-center">Pipeline State</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DDD0] bg-white">
              {/* Row 1: Validated Lease */}
              <tr className="hover:bg-[#FAF7F0]/60 transition-colors">
                <td className="py-4 px-5">
                  <span className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                    <span className="font-mono text-[10px] font-bold text-[#1E6E38]">VERIFIED</span>
                  </span>
                </td>
                <td className="py-4 px-4 font-bold text-[#141414]">
                  <Link href="/documents/doc-sample-01" className="hover:underline flex items-center space-x-1.5">
                    <span>Standard Residential Lease Agreement</span>
                    <ExternalLink className="w-3 h-3 text-[#7A7871]" />
                  </Link>
                  <span className="block text-[10px] font-mono text-[#7A7871] mt-0.5">SHA256: 7f83b165... [DOC-01]</span>
                </td>
                <td className="py-4 px-4 text-[#52524E] font-medium">Oakwood Properties LLC</td>
                <td className="py-4 px-4 font-mono text-[#141414] tabular-nums">2026-11-01 → 2027-10-31</td>
                <td className="py-4 px-4 text-right font-mono font-bold text-[#141414] tabular-nums">$2,400.00 / mo</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EAF5EE] border border-[#A7D7B5] text-[#1E6E38]">
                    100% GROUNDED
                  </span>
                </td>
                <td className="py-4 px-5 text-right">
                  <Link href="/documents/doc-sample-01">
                    <Button size="sm" variant="secondary" className="h-7 text-xs border border-[#2B2B28] rounded-full">
                      Inspect
                    </Button>
                  </Link>
                </td>
              </tr>

              {/* Row 2: Sublease with Pending Review */}
              <tr className="hover:bg-[#FAF7F0]/60 transition-colors">
                <td className="py-4 px-5">
                  <span className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="font-mono text-[10px] font-bold text-[#996500]">PENDING</span>
                  </span>
                </td>
                <td className="py-4 px-4 font-bold text-[#141414]">
                  <span>Chicago Studio Sublease Term Sheet</span>
                  <span className="block text-[10px] font-mono text-[#7A7871] mt-0.5">SHA256: 3c91a042... [DOC-02]</span>
                </td>
                <td className="py-4 px-4 text-[#52524E] font-medium">Metro Living LLC</td>
                <td className="py-4 px-4 font-mono text-[#141414] tabular-nums">2027-01-01 → 2027-06-30</td>
                <td className="py-4 px-4 text-right font-mono font-bold text-[#141414] tabular-nums">$2,400.00 / mo</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FDF5E6] border border-[#E6CA85] text-[#996500]">
                    TEMPORAL OVERLAP
                  </span>
                </td>
                <td className="py-4 px-5 text-right">
                  <Link href="/consequences">
                    <Button size="sm" variant="secondary" className="h-7 text-xs border border-[#2B2B28] rounded-full text-[#DE4A2B] font-bold">
                      View Conflict
                    </Button>
                  </Link>
                </td>
              </tr>

              {/* Row 3: Failed / Action Required Pill */}
              <tr className="hover:bg-[#FAF7F0]/60 transition-colors bg-[#FCEAE5]/30">
                <td className="py-4 px-5">
                  <span className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <span className="font-mono text-[10px] font-bold text-[#C93B2B]">FAILED</span>
                  </span>
                </td>
                <td className="py-4 px-4 font-bold text-[#141414]">
                  <span>Independent Contractor IP Assignment</span>
                  <span className="block text-[10px] font-mono text-[#C93B2B] mt-0.5">Low-DPI Scan OCR Noise Detected</span>
                </td>
                <td className="py-4 px-4 text-[#52524E] font-medium">Nexus Tech Ventures</td>
                <td className="py-4 px-4 font-mono text-[#7A7871] tabular-nums">Undated / Missing Span</td>
                <td className="py-4 px-4 text-right font-mono font-bold text-[#7A7871] tabular-nums">—</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#FCEAE5] border border-[#E57368] text-[#C93B2B]">
                    FAILED • [RETRY REQUIRED]
                  </span>
                </td>
                <td className="py-4 px-5 text-right">
                  <Button size="sm" className="h-7 text-xs bg-[#C93B2B] hover:bg-[#A8281A] text-white rounded-full font-bold">
                    Retry Ingest
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
