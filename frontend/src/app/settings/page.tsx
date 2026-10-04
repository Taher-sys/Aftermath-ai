"use client";

import * as React from "react";
import { Settings, Cpu, Globe, Key, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="relative min-h-screen p-8 space-y-6 max-w-7xl mx-auto select-none bg-[#EFECE1]">
      {/* Blueprint Outer Caliper Dimension Stamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D3CDBC] pb-1 mb-2">
        <div className="flex items-center space-x-3">
          <span>DIM // 12.260</span>
          <span>•</span>
          <span>ENVIRONMENT &amp; CALIBRATION</span>
          <span>•</span>
          <span>GRID 8.00mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>CALIPER: 129 mm</span>
          <span>•</span>
          <span className="text-[#1D64EC] font-bold">AIR-GAP COMPLIANT</span>
          <span>•</span>
          <span>AXIS // 86.290</span>
        </div>
      </div>

      {/* Blueprint Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D3CDBC]">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider mb-1">
            <span>🌱</span>
            <span>MODULE 10.00</span>
            <span>{"//"}</span>
            <span>WORKSPACE CALIBRATION &amp; PROVIDERS</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414] uppercase">Workspace Settings &amp; Engine Config</h1>
          <p className="text-xs text-[#52524E] mt-0.5">
            Model provider endpoints, API keys, default currency, and locale preferences.
          </p>
        </div>
        <Button size="sm" variant="primary" className="space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Provider Configuration */}
        <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] space-y-4">
          <div className="pb-3 border-b border-[#D1CCC0]">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#1D64EC]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#141414]">AI Model Provider</h3>
            </div>
            <p className="text-xs text-[#52524E] mt-0.5">Configure provider endpoints used for structured schema extraction.</p>
          </div>
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] mb-1 uppercase">Active Provider</label>
              <select className="w-full text-xs font-mono border-[1.5px] border-[#1E1E1E] rounded-xl p-2.5 bg-[#FFFFFF] text-[#141414] focus:outline-none">
                <option value="LOCAL_ONNX">Local ONNX / Ollama (Offline Privacy)</option>
                <option value="GOOGLE_GEMINI">Google Gemini 2.0 Flash (Cloud JSON Mode)</option>
                <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet (Legal Nuance)</option>
                <option value="OPENAI">OpenAI GPT-4o (Structured Outputs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] mb-1 uppercase">API Key / Token</label>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full text-xs font-mono border-[1.5px] border-[#1E1E1E] rounded-xl p-2.5 bg-[#FFFFFF] text-[#141414] focus:outline-none"
              />
              <p className="text-[10px] text-[#7A7871] font-mono mt-1">Stored securely in local environment or encrypted vault.</p>
            </div>
          </div>
        </div>

        {/* Currency & Regional Preferences */}
        <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] space-y-4">
          <div className="pb-3 border-b border-[#D1CCC0]">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-[#0F4FC2]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Locale &amp; Regional Units</h3>
            </div>
            <p className="text-xs text-[#52524E] mt-0.5">Default currencies and timezone for deadline projections.</p>
          </div>
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] mb-1 uppercase">Default Currency (ISO 4217)</label>
              <select className="w-full text-xs font-mono border-[1.5px] border-[#1E1E1E] rounded-xl p-2.5 bg-[#FFFFFF] text-[#141414] focus:outline-none">
                <option value="USD">USD — United States Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="CAD">CAD — Canadian Dollar ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] mb-1 uppercase">Timezone (IANA)</label>
              <input
                type="text"
                defaultValue="UTC"
                className="w-full text-xs font-mono border-[1.5px] border-[#1E1E1E] rounded-xl p-2.5 bg-[#FFFFFF] text-[#141414] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
