"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Files,
  FileCheck,
  GitFork,
  CalendarDays,
  ShieldCheck,
  BarChart3,
  Lock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommandItem {
  id: string;
  title: string;
  category: string;
  href?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const items: CommandItem[] = [
    {
      id: "ingest",
      title: "Ingest New Document (PDF / DOCX)",
      category: "Actions",
      href: "/documents",
      icon: Plus,
    },
    {
      id: "simulate-lease",
      title: "Simulate Early Lease Exit & Buyout",
      category: "Simulations",
      href: "/scenarios",
      icon: GitFork,
    },
    {
      id: "check-deadlines",
      title: "Inspect 30-Day Critical Horizon Deadlines",
      category: "Navigation",
      href: "/timeline",
      icon: CalendarDays,
    },
    {
      id: "vault",
      title: "Go to Documents Vault",
      category: "Navigation",
      href: "/documents",
      icon: Files,
    },
    {
      id: "ledger",
      title: "Go to Commitments Ledger",
      category: "Navigation",
      href: "/commitments",
      icon: FileCheck,
    },
    {
      id: "evidence",
      title: "Inspect Grounding & Evidence Records",
      category: "Navigation",
      href: "/evidence",
      icon: ShieldCheck,
    },
    {
      id: "benchmarks",
      title: "Review Model Evaluation & Benchmarks",
      category: "Navigation",
      href: "/evaluation",
      icon: BarChart3,
    },
    {
      id: "privacy",
      title: "Configure Privacy & Local-Only Mode",
      category: "Security",
      href: "/privacy",
      icon: Lock,
    },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected.href) {
          router.push(selected.href);
          onClose();
        } else if (selected.action) {
          selected.action();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#141414]/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[#D1CCC0] bg-[#FFFFFF]">
          <Search className="w-4 h-4 text-[#1D64EC] mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, destination, or contract query..."
            className="w-full h-12 text-xs font-mono text-[#141414] placeholder:text-[#7A7871] bg-transparent focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDE9DD] text-[#141414] border border-[#D1CCC0]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#7A7871] font-mono">
              No matching commands or destinations found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.href) {
                      router.push(item.href);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer select-none transition-all ${
                    isSelected
                      ? "bg-[#EAF5EE] text-[#141414] font-bold border border-[#A7D7B5]"
                      : "text-[#52524E] hover:bg-[#FFFFFF] hover:text-[#141414]"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-[#1E1E1E]" />
                    <span>{item.title}</span>
                  </div>
                  <Badge variant="outline" className="border-[#1E1E1E] font-mono text-[9px]">{item.category}</Badge>
                </div>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2 border-t border-[#D1CCC0] bg-[#EDE9DD] text-[10px] text-[#7A7871] flex items-center justify-between font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ to navigate</span>
            <span>•</span>
            <span>↵ to select</span>
          </div>
          <span>AFTERMATH Core // ISO 8601</span>
        </div>
      </div>
    </div>
  );
}
