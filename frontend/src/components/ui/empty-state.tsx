import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center bg-[#FCFAF7] border-2 border-dashed border-[#2B2B28] rounded-[24px] shadow-sm select-none",
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] text-[#141414] mb-4 shadow-xs">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-[#141414] mb-1 uppercase tracking-tight">{title}</h3>
      <p className="text-xs text-[#52524E] max-w-sm mb-6 leading-relaxed font-mono">{description}</p>
      {actionText && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center h-8 px-4 text-xs font-mono font-medium bg-[#1E1E1E] text-white rounded-full hover:bg-[#000000] border border-[#1E1E1E] transition-all shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
