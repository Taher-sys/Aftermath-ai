"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  Filter,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Clock,
  DollarSign,
  AlertTriangle,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Eye,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TimelineEvent {
  id: string;
  commitmentId: string;
  commitmentTitle: string;
  eventTitle: string;
  date: string; // YYYY-MM-DD
  track: "HOUSING" | "FINANCIAL" | "NOTICE" | "EXPIRATION";
  amount?: number;
  criticality: "CRITICAL" | "HIGH" | "MEDIUM";
  evidenceText: string;
  isRecurring?: boolean;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "evt-01",
    commitmentId: "com-01",
    commitmentTitle: "Springfield Residential Lease",
    eventTitle: "Lease Commencement & Effective Date",
    date: "2026-11-01",
    track: "HOUSING",
    criticality: "HIGH",
    evidenceText: "Commencing on November 1, 2026, and terminating on October 31, 2027.",
  },
  {
    id: "evt-02",
    commitmentId: "com-01",
    commitmentTitle: "Springfield Residential Lease",
    eventTitle: "Security Deposit & 1st Month Rent Due",
    date: "2026-11-01",
    track: "FINANCIAL",
    amount: 4800.0,
    criticality: "HIGH",
    evidenceText: "Tenant shall deposit $2,400.00 USD with Landlord upon signing.",
  },
  {
    id: "evt-03",
    commitmentId: "com-01",
    commitmentTitle: "Springfield Residential Lease",
    eventTitle: "Monthly Rent Payment Due ($2,400.00)",
    date: "2026-12-01",
    track: "FINANCIAL",
    amount: 2400.0,
    criticality: "MEDIUM",
    isRecurring: true,
    evidenceText: "Monthly base rent of $2,400.00 USD due on first day of each month.",
  },
  {
    id: "evt-04",
    commitmentId: "com-02",
    commitmentTitle: "Chicago Studio Sublease",
    eventTitle: "Studio Membership Access Commences",
    date: "2027-01-01",
    track: "HOUSING",
    criticality: "HIGH",
    evidenceText: "Access term begins January 1, 2027.",
  },
  {
    id: "evt-05",
    commitmentId: "com-01",
    commitmentTitle: "Springfield Residential Lease",
    eventTitle: "Earliest 60-Day Notice Window for Early Exit",
    date: "2027-03-01",
    track: "NOTICE",
    criticality: "CRITICAL",
    evidenceText: "Gives at least sixty (60) days prior written notice.",
  },
  {
    id: "evt-06",
    commitmentId: "com-02",
    commitmentTitle: "Chicago Studio Sublease",
    eventTitle: "Studio Agreement Expiration",
    date: "2027-06-30",
    track: "EXPIRATION",
    criticality: "HIGH",
    evidenceText: "Agreement terminates June 30, 2027.",
  },
  {
    id: "evt-07",
    commitmentId: "com-01",
    commitmentTitle: "Springfield Residential Lease",
    eventTitle: "Final Lease Expiration Date",
    date: "2027-10-31",
    track: "EXPIRATION",
    criticality: "CRITICAL",
    evidenceText: "Terminating on October 31, 2027.",
  },
];

export default function TimelinePage() {
  const [zoomLevel, setZoomLevel] = React.useState<"MONTH" | "QUARTER" | "YEAR">("MONTH");
  const [selectedEventId, setSelectedEventId] = React.useState<string>("evt-01");
  const [filterTrack, setFilterTrack] = React.useState<string>("ALL");
  const [enable3dLayer, setEnable3dLayer] = React.useState(true);

  const selectedEvent = TIMELINE_EVENTS.find((e) => e.id === selectedEventId) || TIMELINE_EVENTS[0];

  const filteredEvents =
    filterTrack === "ALL"
      ? TIMELINE_EVENTS
      : TIMELINE_EVENTS.filter((e) => e.track === filterTrack);

  return (
    <div className="relative min-h-screen p-8 space-y-6 max-w-7xl mx-auto select-none bg-[#EFECE1]">
      {/* Blueprint Outer Caliper Dimension Stamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D3CDBC] pb-1 mb-2">
        <div className="flex items-center space-x-3">
          <span>DIM // 38.300</span>
          <span>•</span>
          <span>CHRONO // ISO-8601</span>
          <span>•</span>
          <span>GRID 8.00mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>CALIPER: 129 mm</span>
          <span>•</span>
          <span className="text-[#1D64EC] font-bold">HORIZON 365D</span>
          <span>•</span>
          <span>AXIS // 86.290</span>
        </div>
      </div>

      {/* Blueprint Console Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D3CDBC]">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider mb-1">
            <span>🌱</span>
            <span>MODULE 04.00</span>
            <span>{"//"}</span>
            <span>UNIFIED CHRONOLOGICAL HORIZON</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414] uppercase">
            Unified Commitment Timeline
          </h1>
          <p className="text-xs text-[#52524E] mt-0.5">
            Normalized 30-60-90 day horizon, recurring payment cliffs, and overlapping liability corridors.
          </p>
        </div>

        {/* Controls & Tools */}
        <div className="flex items-center space-x-3">
          {/* Zoom controls */}
          <div className="flex items-center bg-[#FFFFFF] p-1 rounded-full border-[1.5px] border-[#1E1E1E] shadow-sm text-xs font-mono">
            {(["MONTH", "QUARTER", "YEAR"] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoomLevel(z)}
                className={`px-3 py-1 rounded-full transition-all ${
                  zoomLevel === z
                    ? "bg-[#1E1E1E] text-[#FFFFFF]"
                    : "text-[#52524E] hover:text-[#141414]"
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          {/* 3D Depth Toggle */}
          <button
            onClick={() => setEnable3dLayer(!enable3dLayer)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border-[1.5px] text-xs font-mono transition-all ${
              enable3dLayer
                ? "bg-[#1E1E1E] text-[#FFFFFF] border-[#1E1E1E]"
                : "bg-[#FFFFFF] text-[#52524E] border-[#1E1E1E]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D SPATIAL DEPTH</span>
          </button>
        </div>
      </div>

      {/* KPI Horizon Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
            <span>TOTAL SCHEDULED MILESTONES</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>
          <div className="text-[42px] font-bold font-mono text-[#1D64EC] leading-tight mt-1 tabular-nums">
            0{TIMELINE_EVENTS.length}
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>Full Horizon Mapped</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">7 checkpoints</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
            <span>PEAK SINGLE CASH OUTLAY</span>
            <span className="text-[#0F4FC2]">✦</span>
          </div>
          <div className="text-[42px] font-bold font-mono text-[#0F4FC2] leading-tight mt-1 tabular-nums">
            $4,800
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FCFAF7] border border-[#D1CCC0] text-[10px] font-mono text-[#141414]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F4FC2]" />
              <span>Nov 1, 2026 (Deposit + Rent)</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">due in 28d</span>
          </div>
        </div>

        <div className="bg-[#FCEAE5] border-[1.5px] border-[#E57368] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#C93B2B] uppercase">
            <span>CRITICAL CLIFFS / EXPIRATIONS</span>
            <span className="text-[#DE4A2B]">✦</span>
          </div>
          <div className="text-[42px] font-bold font-mono text-[#DE4A2B] leading-tight mt-1 tabular-nums">
            02
          </div>
          <div className="mt-3 pt-3 border-t border-[#E57368]/40 flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E57368] text-[10px] font-mono text-[#C93B2B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              <span>FAILED • [RETRY REQUIRED]</span>
            </div>
            <span className="text-[10px] font-mono text-[#C93B2B] font-bold">2 CLIFFS</span>
          </div>
        </div>
      </div>

      {/* Overlapping Commitments Alert Banner in Terracotta Status Container */}
      <div className="p-5 bg-[#FCEAE5] border-[1.5px] border-[#E57368] rounded-2xl flex items-start justify-between shadow-[0_3px_6px_rgba(0,0,0,0.05)]">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E57368] flex items-center justify-center shrink-0 mt-0.5 text-[#C93B2B]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono text-[#C93B2B] uppercase">
                TEMPORAL OVERLAP DETECTED
              </span>
              <span className="text-[10px] font-mono bg-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#E57368] text-[#C93B2B]">
                2027-01-01 → 2027-06-30
              </span>
            </div>
            <p className="text-xs text-[#141414] mt-1">
              <strong>Springfield Lease</strong> concurrently active with <strong>Chicago Studio Sublease</strong> for 6 calendar months. Combined monthly liability: <strong className="font-mono text-[#DE4A2B] font-bold">$3,250.00 / month</strong>.
            </p>
          </div>
        </div>
        <Link href="/consequences">
          <Button size="sm" variant="pill" className="text-xs font-mono border-[1.5px] border-[#1E1E1E]">
            Inspect Conflict
          </Button>
        </Link>
      </div>

      {/* Main Timeline Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chronological Multi-Track Horizon */}
        <div className="lg:col-span-2 bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 space-y-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)]">
          {/* Caliper Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#D1CCC0] font-mono text-[11px] text-[#7A7871]">
            <span>HORIZON START: 2026-11-01</span>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[#141414] font-medium">ACTIVE TRACKS: HOUSING · FINANCIAL · NOTICE</span>
            </div>
            <span>HORIZON END: 2027-10-31</span>
          </div>

          {/* Month Marker Bar */}
          <div className="grid grid-cols-12 gap-1 text-[10px] font-mono text-center text-[#7A7871] pb-2 border-b border-[#D1CCC0]">
            <div>NOV &apos;26</div>
            <div>DEC</div>
            <div>JAN &apos;27</div>
            <div>FEB</div>
            <div>MAR</div>
            <div>APR</div>
            <div>MAY</div>
            <div>JUN</div>
            <div>JUL</div>
            <div>AUG</div>
            <div>SEP</div>
            <div>OCT &apos;27</div>
          </div>

          {/* Chronological Event Stream */}
          <div className="space-y-3 relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#D1CCC0]" />

            {filteredEvents.map((evt) => {
              const isSelected = selectedEventId === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`relative pl-9 cursor-pointer transition-all ${
                    isSelected ? "scale-[1.01]" : ""
                  }`}
                >
                  {/* Timeline Node Point */}
                  <div
                    className={`absolute left-2.5 top-4 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isSelected
                        ? "bg-[#1E1E1E] border-[#1E1E1E] shadow-sm"
                        : "bg-[#FFFFFF] border-[#7A7871]"
                    }`}
                  />

                  {/* Event Card */}
                  <div
                    className={`p-4 rounded-2xl border-[1.5px] transition-all ${
                      isSelected
                        ? "bg-[#FFFFFF] border-[#1E1E1E] shadow-[0_3px_6px_rgba(0,0,0,0.06)] ring-1 ring-[#1E1E1E]"
                        : "bg-[#FFFFFF] border-[#1E1E1E]/40 hover:border-[#1E1E1E] shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-[#141414]">
                            {evt.date}
                          </span>
                          <Badge
                            variant={
                              evt.criticality === "CRITICAL"
                                ? "error"
                                : evt.criticality === "HIGH"
                                ? "warning"
                                : "outline"
                            }
                            className="border-[#1E1E1E]"
                          >
                            {evt.track}
                          </Badge>
                          {evt.isRecurring && (
                            <Badge variant="outline" className="text-[9px] border-[#1E1E1E]">
                              RECURRING
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-[#141414] mt-1">
                          {evt.eventTitle}
                        </h4>
                        <p className="text-xs text-[#52524E]">
                          Source: {evt.commitmentTitle}
                        </p>
                      </div>

                      {evt.amount && (
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-[#1D64EC] tabular-nums">
                            ${evt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Timeline Event & Evidence Inspector */}
        <div className="space-y-4">
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] sticky top-6">
            <div className="pb-3 border-b border-[#D1CCC0]">
              <div className="flex items-center space-x-1 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider">
                <span>✦</span>
                <span>TEMPORAL EVENT DETAILS</span>
              </div>
              <h3 className="text-base font-bold text-[#141414] mt-1 uppercase tracking-tight">
                {selectedEvent.eventTitle}
              </h3>
              <span className="text-xs font-mono text-[#1D64EC] font-semibold">
                Scheduled: {selectedEvent.date}
              </span>
            </div>

            {/* Criticality & Impact */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-[#D1CCC0]">
                <span className="text-[#52524E]">Criticality:</span>
                <Badge
                  variant={
                    selectedEvent.criticality === "CRITICAL"
                      ? "error"
                      : selectedEvent.criticality === "HIGH"
                      ? "warning"
                      : "outline"
                  }
                  className="border-[#1E1E1E]"
                >
                  {selectedEvent.criticality}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#D1CCC0]">
                <span className="text-[#52524E]">Track:</span>
                <span className="font-mono font-medium text-[#141414]">{selectedEvent.track}</span>
              </div>

              {selectedEvent.amount && (
                <div className="flex justify-between items-center py-2 border-b border-[#D1CCC0]">
                  <span className="text-[#52524E]">Cash Impact:</span>
                  <span className="font-mono font-bold text-[#1D64EC] tabular-nums">
                    ${selectedEvent.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              )}

              {/* Verbatim Source Evidence */}
              <div className="mt-4 pt-2 space-y-2">
                <div className="text-[10px] font-mono text-[#7A7871] uppercase tracking-wider flex items-center justify-between">
                  <span>CRYPTOGRAPHIC EVIDENCE</span>
                  <span className="text-[#1E6E38] font-semibold">🌱 GROUNDED</span>
                </div>
                <div className="p-3 bg-[#FFFFFF] border border-[#D1CCC0] rounded-xl text-xs text-[#141414] italic leading-relaxed">
                  &ldquo;{selectedEvent.evidenceText}&rdquo;
                </div>
                <div className="text-[10px] font-mono text-[#7A7871]">
                  Verified against Source Document Version v1.0 // 12.260
                </div>
              </div>

              {/* Jump to Document */}
              <div className="pt-4">
                <Link href="/documents/doc-sample-01">
                  <Button size="sm" variant="secondary" className="w-full space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Clause in Document Inspector</span>
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
