import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "panel" | "metric" | "inset";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  const variantStyles = {
    default:
      "bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] transition-all",
    panel:
      "bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)]",
    metric:
      "bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)]",
    inset:
      "bg-[#FFFFFF] border border-[#D1CCC0] rounded-xl p-4 shadow-none",
  };

  return <div className={cn(variantStyles[variant], className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1 mb-3.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-xs font-mono uppercase tracking-wider font-semibold text-[#141414]", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-[#52524E]", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-xs text-[#141414]", className)} {...props} />;
}
