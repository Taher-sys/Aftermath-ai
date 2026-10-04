import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "pill";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none select-none";

    const variantStyles = {
      primary:
        "bg-[#141414] text-[#FFFFFF] hover:bg-[#2A2A2A] active:bg-[#000000] border border-[#1E1E1E] shadow-sm",
      secondary:
        "bg-[#FFFFFF] text-[#141414] border border-[#DCD5C9] hover:bg-[#F5F2EB] hover:border-[#C8C1B3] active:bg-[#EFEAE1] shadow-xs",
      pill:
        "bg-[#FFFFFF] text-[#141414] border border-[#1E1E1E] hover:bg-[#141414] hover:text-[#FFFFFF] rounded-full shadow-xs",
      ghost:
        "bg-transparent text-[#52524E] hover:text-[#141414] hover:bg-[#F5F2EB] border border-transparent",
      danger:
        "bg-[#DC2626] text-[#FFFFFF] hover:bg-[#B91C1C] border border-[#B91C1C] shadow-sm",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-full",
      md: "h-9 px-4 text-xs rounded-full",
      lg: "h-11 px-6 text-sm rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
