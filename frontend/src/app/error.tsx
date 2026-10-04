"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("AFTERMATH Application Shell Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center select-none bg-[#EFECE1]">
      <div className="bg-[#FCEAE5] border-[1.5px] border-[#E57368] rounded-[24px] p-8 max-w-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border-[1.5px] border-[#E57368] flex items-center justify-center text-[#C93B2B] mb-4 shadow-xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#C93B2B] mb-2 uppercase tracking-tight font-mono">
          FAILED • [RETRY REQUIRED]
        </h2>
        <p className="text-xs text-[#141414] max-w-md mb-6 leading-relaxed font-mono">
          {error.message || "An unexpected error occurred while rendering the commitment view."}
        </p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => reset()}
          className="space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reload View</span>
        </Button>
      </div>
    </div>
  );
}
