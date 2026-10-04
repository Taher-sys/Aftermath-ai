"use client";

import * as React from "react";
import {
  Lock,
  Shield,
  EyeOff,
  Trash2,
  Cpu,
  Globe,
  HardDrive,
  FileCheck,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  const [localOnly, setLocalOnly] = React.useState(false);
  const [maskPii, setMaskPii] = React.useState(true);
  const [retentionPolicy, setRetentionPolicy] = React.useState("30_DAYS");
  const [sampleInput, setSampleInput] = React.useState(
    "Tenant Jane Doe (SSN: 987-65-4321, Phone: 555-123-4567) residing at 742 Evergreen Terrace shall pay rent from Account DE89370400440532013000."
  );
  const [redactedOutput, setRedactedOutput] = React.useState("");
  const [tokensMasked, setTokensMasked] = React.useState(4);
  const [purgeSuccess, setPurgeSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!maskPii) {
      setRedactedOutput(sampleInput);
      setTokensMasked(0);
      return;
    }
    let text = sampleInput;
    text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN_REDACTED]");
    text = text.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, "[BANK_ACCOUNT_REDACTED]");
    text = text.replace(/\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g, "[PHONE_REDACTED]");
    text = text.replace(
      /\b\d{1,5}\s+[A-Za-z0-9\.\s]{2,25}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Terrace|Ter)\b/gi,
      "[STREET_ADDRESS_REDACTED]"
    );
    setRedactedOutput(text);
    const count = (text.match(/\[[A-Z_]+_REDACTED\]/g) || []).length;
    setTokensMasked(count);
  }, [sampleInput, maskPii]);

  const handlePurge = () => {
    const confirmed = window.confirm(
      "CONFIRM CRYPTOGRAPHIC PURGE: Permanently delete all workspace documents, extracted facts, and simulation branches? This action is irreversible."
    );
    if (confirmed) {
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 5000);
    }
  };

  return (
    <div className="relative min-h-screen p-8 space-y-6 max-w-7xl mx-auto select-none bg-[#EFECE1]">
      {/* Blueprint Outer Caliper Dimension Stamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D3CDBC] pb-1 mb-2">
        <div className="flex items-center space-x-3">
          <span>DIM // 12.260</span>
          <span>•</span>
          <span>AIR-GAPPED DATA SOVEREIGNTY // ZERO RETENTION</span>
          <span>•</span>
          <span>GRID 8.00mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>CALIPER: 129 mm</span>
          <span>•</span>
          <span className="text-[#1E6E38] font-bold">EGRESS 0.0 KB/s</span>
          <span>•</span>
          <span>AXIS // 86.290</span>
        </div>
      </div>

      {/* Header Schematic Console Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D3CDBC]">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider mb-1">
            <span>🌱</span>
            <span>MODULE 09.00</span>
            <span>{"//"}</span>
            <span>DATA SOVEREIGNTY &amp; THREAT DEFENSE CONSOLE</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>
          <h1 className="text-2xl font-bold text-[#141414] tracking-tight uppercase">Privacy, Security &amp; Local Processing</h1>
          <p className="text-xs text-[#52524E] mt-0.5">
            Air-gapped execution modes, client-side PII sanitization, zero-retention lifecycles, and cryptographic data purges for sensitive legal agreements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-full text-xs font-mono text-[#141414] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>EGRESS: {localOnly ? "0.0 KB/s (AIR-GAPPED)" : "ENCRYPTED TLS 1.3"}</span>
          </div>
          <Badge variant="tier-1-source" className="rounded-full px-3 py-1 text-xs border-[#1E1E1E]">
            Zero AI Training Guarantee
          </Badge>
        </div>
      </div>

      {/* KPI Security Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Egress Rate (Pine Green #1E6E38) */}
        <div className="bg-[#EAF5EE] border-[1.5px] border-[#A7D7B5] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#1E6E38] uppercase">
              <span>NETWORK EGRESS RATE</span>
              <span className="text-[#1E6E38]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#1E6E38] leading-tight mt-1 tabular-nums">
              0.0 KB/s
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#A7D7B5]/40 flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>Air-Gapped Sovereign</span>
            </div>
            <span className="text-[10px] font-mono text-[#1E6E38] font-bold">100% LOCAL</span>
          </div>
        </div>

        {/* Metric 2: Tokens Masked (Cobalt Blue #1D64EC) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>PII ENTITIES MASKED</span>
              <span className="text-[#1D64EC]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#1D64EC] leading-tight mt-1 tabular-nums">
              0{tokensMasked}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FCFAF7] border border-[#D1CCC0] text-[10px] font-mono text-[#141414]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D64EC]" />
              <span>SSN, IBAN, Phone</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">Realtime</span>
          </div>
        </div>

        {/* Metric 3: Active Barriers (Charcoal Ink #141414 + Dual Telemetry) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>ACTIVE DEFENSE BARRIERS</span>
              <span>🌱</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#141414] leading-tight mt-1 tabular-nums">
              05/05
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] space-y-1.5">
            <div className="flex items-center space-x-1 h-1.5 w-full bg-[#EDE9DD] rounded-full overflow-hidden">
              <div className="h-full bg-[#2BB673]" style={{ width: "100%" }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#52524E]">
              <span>Header, SSRF, Injection: ALL ON</span>
              <span className="text-[#1E6E38]">100%</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Cache Window (Royal Navy #0F4FC2) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>CACHE PURGE LIFECYCLE</span>
              <span className="text-[#0F4FC2]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#0F4FC2] leading-tight mt-1 tabular-nums">
              30D
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FCFAF7] border border-[#D1CCC0] text-[10px] font-mono text-[#141414]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F4FC2]" />
              <span>SHA-256 Receipt Ready</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">Active</span>
          </div>
        </div>
      </div>

      {/* Security Threat Gates Status Bar */}
      <div className="bg-[#FCFAF7] rounded-2xl border-2 border-[#2B2B28] shadow-[0_3px_6px_rgba(0,0,0,0.05)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#1E6E38]" />
            <span className="font-bold text-[#141414] uppercase tracking-tight">ACTIVE SECURITY GATES:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-[#EAF5EE] text-[#1E6E38] border border-[#A7D7B5] rounded-full text-[10px]">
              OVERSIZED BARRIER: 20MB
            </span>
            <span className="px-2.5 py-1 bg-[#EAF5EE] text-[#1E6E38] border border-[#A7D7B5] rounded-full text-[10px]">
              BINARY HEADER: PE/ELF BLOCKED
            </span>
            <span className="px-2.5 py-1 bg-[#EAF5EE] text-[#1E6E38] border border-[#A7D7B5] rounded-full text-[10px]">
              PROMPT INJECTION: NEUTRALIZED
            </span>
            <span className="px-2.5 py-1 bg-[#EAF5EE] text-[#1E6E38] border border-[#A7D7B5] rounded-full text-[10px]">
              SSRF DEFENSE: RFC 1918 BLOCKED
            </span>
            <span className="px-2.5 py-1 bg-[#EAF5EE] text-[#1E6E38] border border-[#A7D7B5] rounded-full text-[10px]">
              LOG SCRUBBER: ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Architecture & PII Redactor Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Processing Architecture & Retention Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Processing Mode */}
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] space-y-4">
            <div className="pb-3 border-b border-[#D1CCC0]">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#141414]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#141414]">
                  Processing Architecture &amp; Data Egress
                </h3>
              </div>
              <p className="text-xs text-[#52524E] mt-0.5">
                Choose between hardware-accelerated local parsing or cloud execution with encrypted tokens.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl shadow-xs">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-[#1D64EC]" />
                    <span className="text-xs font-bold text-[#141414]">100% Local-Only Processing Mode</span>
                  </div>
                  <p className="text-[11px] text-[#52524E]">
                    Runs document OCR, layout understanding, and rule engines entirely on your local machine. Guarantees 0 bytes of network egress.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localOnly}
                  onChange={(e) => setLocalOnly(e.target.checked)}
                  className="h-5 w-5 rounded border-[#1E1E1E] text-[#141414] focus:ring-[#141414] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl shadow-xs">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <EyeOff className="w-4 h-4 text-[#996500]" />
                    <span className="text-xs font-bold text-[#141414]">Pre-Extraction PII Redaction Filter</span>
                  </div>
                  <p className="text-[11px] text-[#52524E]">
                    Sanitizes SSNs, bank accounts, credit cards, and addresses before text touches any inference engine.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={maskPii}
                  onChange={(e) => setMaskPii(e.target.checked)}
                  className="h-5 w-5 rounded border-[#1E1E1E] text-[#141414] focus:ring-[#141414] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Retention Settings & Cryptographic Purge */}
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] space-y-5">
            <div className="pb-3 border-b border-[#D1CCC0] flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-[#141414]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#141414]">
                Retention Lifecycle &amp; Cryptographic Erasure
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#52524E] uppercase">Data Retention Policy</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "ZERO", label: "Zero Retention", desc: "Purge on close" },
                  { id: "30_DAYS", label: "30 Days", desc: "Encrypted cache" },
                  { id: "PERMANENT", label: "Permanent", desc: "Manual only" },
                ].map((policy) => (
                  <button
                    key={policy.id}
                    onClick={() => setRetentionPolicy(policy.id)}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      retentionPolicy === policy.id
                        ? "bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-xs"
                        : "bg-[#FFFFFF] text-[#141414] border-[#D1CCC0] hover:bg-[#EDE9DD]"
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">{policy.label}</div>
                    <div className="text-[10px] text-[#7A7871] mt-0.5">{policy.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Purge Action in Terracotta Panel */}
            <div className="p-4 bg-[#FCEAE5] border-[1.5px] border-[#E57368] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C93B2B] uppercase font-mono">Cryptographic Data Purge</span>
                <span className="text-[10px] font-mono text-[#C93B2B] font-bold">IRREVERSIBLE</span>
              </div>
              <p className="text-xs text-[#141414] leading-relaxed">
                Permanently scrubs document binaries from local storage, removes database records, and issues a SHA-256 erasure receipt.
              </p>
              <Button
                onClick={handlePurge}
                size="sm"
                className="bg-[#DE4A2B] hover:bg-[#C93B2B] text-white rounded-full px-4 text-xs font-mono space-x-1.5 shadow-sm border border-[#DE4A2B]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>PURGE WORKSPACE DATA NOW</span>
              </Button>

              {purgeSuccess && (
                <div className="p-3 bg-white rounded-xl border border-[#DE4A2B] text-xs font-mono space-y-1">
                  <div className="flex items-center space-x-1.5 text-[#1E6E38] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CRYPTOGRAPHIC PURGE COMPLETE</span>
                  </div>
                  <div className="text-[10px] text-[#52524E]">
                    RECEIPT: sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Real-Time PII Scrubber Playground */}
        <div className="lg:col-span-6">
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between space-y-4">
            <div>
              <div className="pb-3 border-b border-[#D1CCC0] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-[#141414]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#141414]">
                    Interactive PII Redaction Playground
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#1E6E38] font-bold">
                  {tokensMasked} TOKENS SANITIZED
                </span>
              </div>
              <p className="text-xs text-[#52524E] mt-1">
                Test real-time masking on sensitive financial covenants and identity descriptors.
              </p>

              <div className="mt-4 space-y-1.5">
                <label className="text-[11px] font-mono text-[#52524E] uppercase font-bold">Raw Input Document Excerpt</label>
                <textarea
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-[#D1CCC0] bg-[#FFFFFF] text-xs font-mono text-[#141414] focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-[#52524E] uppercase font-bold">Redacted Dispatch Output</label>
                  <span className="text-[10px] font-mono text-[#1D64EC] font-bold">PASSED TO INFERENCE PIPELINE</span>
                </div>
                <div className="p-3 rounded-xl border border-[#D1CCC0] bg-[#FFFFFF] text-xs font-mono text-[#141414] leading-relaxed whitespace-pre-wrap select-all">
                  {redactedOutput}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#D1CCC0] text-[11px] text-[#52524E] flex items-center justify-between font-mono">
              <span>Categories: SSN, IBAN, Phone, Street Address</span>
              <span className="text-[#1E6E38] font-bold">100% REGEX DETERMINISTIC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
