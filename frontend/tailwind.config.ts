import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#F8FAFC", // Architectural light canvas
          subtle: "#F1F5F9",
          card: "#FFFFFF",
        },
        border: {
          subtle: "#E2E8F0",
          strong: "#CBD5E1",
          focus: "#6366F1",
        },
        ink: {
          primary: "#0F172A",
          secondary: "#334155",
          muted: "#64748B",
          faint: "#94A3B8",
        },
        tier: {
          source: "#059669",      // Tier 1: Sage Green
          extracted: "#2563EB",   // Tier 2: Steel Blue
          deterministic: "#4F46E5", // Tier 3: Muted Indigo
          scenario: "#7C3AED",    // Tier 4: Slate Violet
          hypothesis: "#D97706",  // Tier 5: Warm Ochre
          conflict: "#DC2626",    // Tier 6: Brick Terracotta
        },
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        heading: ["'Space Grotesk'", "'Plus Jakarta Sans'", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
