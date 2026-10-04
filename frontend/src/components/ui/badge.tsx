import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "tier-1-source"
    | "tier-2-extracted"
    | "tier-3-deterministic"
    | "tier-4-scenario"
    | "tier-5-hypothesis"
    | "tier-6-conflict"
    | "outline"
    | "charcoal-pill"
    | "success"
    | "warning"
    | "error";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[#FFFFFF] text-[#141414] border-[#DCD5C9]",
    "tier-1-source": "bg-[#ECFDF5] text-[#16A34A] border-[#BBF7D0]",
    "tier-2-extracted": "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    "tier-3-deterministic": "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]",
    "tier-4-scenario": "bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]",
    "tier-5-hypothesis": "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    "tier-6-conflict": "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
    outline: "bg-transparent text-[#52524E] border-[#DCD5C9]",
    "charcoal-pill": "bg-[#141414] text-[#FFFFFF] border-[#1E1E1E] rounded-full",
    success: "bg-[#ECFDF5] text-[#16A34A] border-[#BBF7D0]",
    warning: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    error: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border tabular-nums select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
