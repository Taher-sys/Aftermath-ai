"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, CheckCircle2, Shield, GitBranch, Scale, Lock, Compass, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Dynamically import 3D canvas with SSR disabled to eliminate hydration mismatches
const DecisionBackdrop = dynamic(
  () => import("@/components/canvas3d/decision-backdrop").then((mod) => mod.DecisionBackdrop),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <div className="relative min-h-full flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-[#EFECE1] select-none">
      {/* 3D Information Backdrop */}
      <DecisionBackdrop />

      {/* Top Drafting Guideline & Dimension Marks */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D1CCC0] pb-2 mb-6">
        <div className="flex items-center space-x-3">
          <Crosshair className="w-3 h-3 text-[#141414]" />
          <span>SPEC: ISO 8601 // ARCHITECTURAL CONSOLE</span>
          <span className="text-[#D3CDBC]">┼</span>
          <span>CAL: 12.260</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>TOLERANCE: 0.00mm</span>
          <span className="text-[#D3CDBC]">│</span>
          <span>SCALE: 100</span>
        </div>
      </div>

      {/* Hero Header in Blueprint Console Style */}
      <div className="relative z-10 max-w-3xl pt-2 space-y-4">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border-[1.5px] border-[#2B2B28] text-xs font-mono font-bold text-[#141414] shadow-xs">
            <span className="text-[#16A34A]">🌱</span>
            <span>AFTERMATH ARCHITECTURE</span>
            <span className="text-[#DE4A2B]">✦</span>
          </span>
          <span className="text-xs text-[#7A7871] font-mono">10 Engineering Modules Active</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#141414] uppercase leading-tight">
          Understand what you are actually committing to.
        </h1>

        <p className="text-sm md:text-base text-[#52524E] leading-relaxed max-w-2xl font-medium">
          An open-source, evidence-backed commitment and consequence exploration system. Ingest employment contracts, residential leases, and debt agreements to simulate counterfactual what-if scenarios with verifiable mathematical consequences.
        </p>

        <div className="flex items-center space-x-4 pt-2">
          <Link href="/dashboard">
            <Button size="md" className="space-x-2 rounded-full bg-[#1E1E1E] hover:bg-[#2A2A2A] text-white font-bold px-6 py-2.5 shadow-sm border-[1.5px] border-[#1E1E1E]">
              <span>Open Workspace Console</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/documents">
            <Button size="md" variant="secondary" className="rounded-full bg-white hover:bg-[#FAF7F0] text-[#141414] font-bold px-5 py-2.5 border-[1.5px] border-[#2B2B28] shadow-xs">
              View Document Vault
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-Column Architectural Grounding Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        <div className="blueprint-card-tactile bg-white p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-[#EAF5EE] border border-[#A7D7B5] flex items-center justify-center text-[#1E6E38]">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-[#141414] uppercase font-mono tracking-wider">
                Zero Unanchored Facts
              </h2>
            </div>
            <span className="text-xs text-[#16A34A]">✦</span>
          </div>
          <p className="text-xs text-[#52524E] leading-normal font-medium">
            Every extracted obligation, fee, or deadline links to character-level source text in the original document. No machine guessing.
          </p>
        </div>

        <div className="blueprint-card-tactile bg-white p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#0F4FC2]">
                <GitBranch className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-[#141414] uppercase font-mono tracking-wider">
                Deterministic Simulation
              </h2>
            </div>
            <span className="text-xs text-[#0F4FC2]">✦</span>
          </div>
          <p className="text-xs text-[#52524E] leading-normal font-medium">
            Test counterfactuals: early exit, delayed client payment, or notice deficits calculated via discrete-event graph mathematics.
          </p>
        </div>

        <div className="blueprint-card-tactile bg-white p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-[#FCEAE5] border border-[#E57368] flex items-center justify-center text-[#DE4A2B]">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-[#141414] uppercase font-mono tracking-wider">
                Human Agency First
              </h2>
            </div>
            <span className="text-xs text-[#DE4A2B]">✦</span>
          </div>
          <p className="text-xs text-[#52524E] leading-normal font-medium">
            The platform informs and explains consequences; it never dictates what choice a human being must make.
          </p>
        </div>
      </div>
    </div>
  );
}
