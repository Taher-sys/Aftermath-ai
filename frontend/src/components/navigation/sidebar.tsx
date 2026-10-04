"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Files,
  UploadCloud,
  BarChart3,
  Lock,
  Settings,
  Scale,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

interface UtilityTool {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description: string;
}

const utilityTools: UtilityTool[] = [
  {
    title: "Documents Vault",
    href: "/documents",
    icon: Files,
    badge: "INGEST",
    description: "Multi-modal contract ingestion & vault",
  },
  {
    title: "Model Evaluation",
    href: "/evaluation",
    icon: BarChart3,
    badge: "BENCH",
    description: "Multi-model calibration & F1 metrics",
  },
  {
    title: "Privacy & Sovereignty",
    href: "/privacy",
    icon: Lock,
    badge: "AIR-GAP",
    description: "Air-gapped execution & PII filter",
  },
  {
    title: "Workspace Settings",
    href: "/settings",
    icon: Settings,
    badge: "CONFIG",
    description: "Provider endpoints & environment",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r-[1.5px] border-[#1E1E1E] bg-[#FCFAF7] flex flex-col h-screen shrink-0 select-none relative z-20 shadow-xs">
      {/* Top: Brand / Project Identity */}
      <div className="h-14 border-b-[1.5px] border-[#1E1E1E] px-4 flex items-center justify-between bg-[#FCFAF7]">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#141414] flex items-center justify-center text-[#EFECE1] border border-[#1E1E1E] shadow-2xs">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xs tracking-tight text-[#141414] uppercase block leading-none">
                AFTERMATH CI/CD
              </span>
              <span className="text-[10px]">🌱</span>
            </div>
            <span className="text-[9px] font-mono text-[#7A7871] block mt-0.5 tracking-tight font-medium">
              COMMITMENT CONSOLE ✦
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Sleek Utility Dock & Minimal Action Tools */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Quick Upload Action Button */}
        <div className="pt-1">
          <Link
            href="/documents"
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-xl bg-[#1E1E1E] text-white hover:bg-[#000000] border border-[#1E1E1E] text-xs font-mono font-medium shadow-xs transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </Link>
        </div>

        {/* Workspace Utility Tools Header */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[9px] font-mono font-bold text-[#7A7871] uppercase tracking-wider flex items-center justify-between">
            <span>UTILITY DOCK</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>

          {utilityTools.map((tool) => {
            const isActive =
              pathname === tool.href ||
              (tool.href !== "/" && pathname.startsWith(tool.href));
            const Icon = tool.icon;

            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={cn(
                  "flex items-start space-x-2.5 p-2.5 rounded-xl text-xs transition-all border",
                  isActive
                    ? "bg-[#FFFFFF] text-[#141414] font-bold border-[1.5px] border-[#1E1E1E] shadow-xs"
                    : "text-[#52524E] hover:text-[#141414] hover:bg-[#EFECE1] border-transparent"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 transition-all",
                    isActive
                      ? "bg-[#141414] text-white border-[#141414]"
                      : "bg-[#FFFFFF] text-[#52524E] border-[#D1CCC0]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-semibold text-[#141414]">{tool.title}</span>
                    {tool.badge && (
                      <span
                        className={cn(
                          "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border leading-none uppercase shrink-0 ml-1",
                          isActive
                            ? "bg-[#1E1E1E] text-white border-[#1E1E1E]"
                            : "bg-[#EDE9DD] text-[#52524E] border-[#D1CCC0]"
                        )}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#7A7871] truncate font-mono mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom: System Status & Verification Telemetry */}
      <div className="p-3 border-t-[1.5px] border-[#1E1E1E] bg-[#FCFAF7] space-y-2">
        <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D1CCC0] space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center space-x-1.5 text-[#141414] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>SYS: ACTIVE</span>
            </span>
            <span className="text-[9px] font-mono text-[#7A7871]">BUILD v1.0.4</span>
          </div>
          <div className="pt-1 border-t border-[#EDE9DD] flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#52524E] font-medium">GROUNDING GATE:</span>
            <span className="text-[#1E6E38] font-bold">100% VERIFIED</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
