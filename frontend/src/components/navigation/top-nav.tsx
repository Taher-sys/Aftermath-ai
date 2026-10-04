"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { CommandPalette } from "@/components/navigation/command-palette";

export function TopNav() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);

  const modules = [
    { label: "Overview", href: "/dashboard" },
    { label: "Commitment Map", href: "/commitments" },
    { label: "Timeline", href: "/timeline" },
    { label: "Conflicts", href: "/consequences" },
    { label: "Scenarios", href: "/scenarios" },
    { label: "Evidence", href: "/evidence" },
  ];

  return (
    <>
      <header
        style={{ backdropFilter: "none", opacity: 1 }}
        className="sticky top-0 z-50 h-14 border-b-[1.5px] border-[#1E1E1E] bg-[#EFECE1] px-6 flex items-center justify-between shrink-0 select-none shadow-xs"
      >
        {/* Left: System Badge & Active Workspace Indicator */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Agent Group Status Badge */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="font-bold text-[#141414] text-[11px] uppercase tracking-wider">
                Agent Dev (Aegis Group)
              </span>
            </span>
          </div>

          {/* Active Workspace Label */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs font-mono text-[#52524E]">
            <span className="text-[10px] text-[#7A7871] uppercase tracking-wider">WORKSPACE:</span>
            <span className="font-bold text-[#141414] bg-[#FFFFFF] border border-[#D1CCC0] px-2.5 py-0.5 rounded-full text-[10px]">
              PRIMARY-LEASE-2026
            </span>
          </div>
        </div>

        {/* Center: Primary View Controller (Deduplicated Horizontal Navigation Pill Bar) */}
        <nav aria-label="Workspace views" className="flex items-center space-x-1 bg-[#FFFFFF] p-1 rounded-full border-[1.5px] border-[#1E1E1E] shadow-2xs">
          {modules.map((m) => {
            const active = pathname === m.href || (m.href !== "/dashboard" && pathname.startsWith(m.href));
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap font-medium ${
                  active
                    ? "bg-[#1E1E1E] text-[#FFFFFF] font-bold shadow-xs"
                    : "text-[#52524E] hover:text-[#1E1E1E] hover:bg-[#EFECE1]"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Telemetry Indicators & Command Console */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Status Telemetry Badges */}
          <div className="hidden xl:flex items-center space-x-2 font-mono text-[10px]">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[#1E6E38] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>8 FACTS GROUNDED</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FCEAE5] border border-[#E57368] text-[#C93B2B] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              <span>1 CONFLICT</span>
            </div>
          </div>

          {/* Command Console Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            aria-label="Open command palette"
            className="flex items-center space-x-2 px-3.5 py-1.5 text-xs rounded-full border-[1.5px] border-[#1E1E1E] bg-[#FFFFFF] hover:bg-[#FCFAF7] text-[#141414] font-medium shadow-2xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#141414]" />
            <span className="hidden md:inline font-mono text-[11px] font-semibold">Command Console</span>
            <kbd className="hidden md:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EDE9DD] border border-[#D1CCC0] text-[#141414] font-bold">
              ⌘K
            </kbd>
          </button>
        </div>
      </header>

      {/* Global Command Palette Component */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
