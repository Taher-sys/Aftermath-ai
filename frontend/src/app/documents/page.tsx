"use client";

import * as React from "react";
import Link from "next/link";
import {
  Files,
  UploadCloud,
  FileText,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Eye,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface IngestedDocument {
  id: string;
  title: string;
  format: "PDF" | "SCAN_OCR" | "PLAIN_TEXT";
  pages: number;
  sha256: string;
  factsExtracted: number;
  status: "VERIFIED" | "NEEDS_REVIEW" | "PROCESSING";
  timestamp: string;
}

const INGESTED_DOCS: IngestedDocument[] = [
  {
    id: "doc-sample-01",
    title: "Standard Residential Lease Agreement (Oakwood Properties)",
    format: "PDF",
    pages: 3,
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    factsExtracted: 8,
    status: "VERIFIED",
    timestamp: "4 min ago",
  },
  {
    id: "doc-sample-02",
    title: "Chicago Co-Working & Creative Studio Sublease",
    format: "SCAN_OCR",
    pages: 2,
    sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    factsExtracted: 4,
    status: "VERIFIED",
    timestamp: "25 min ago",
  },
];

export default function DocumentsPage() {
  return (
    <div className="relative min-h-screen p-8 space-y-6 max-w-7xl mx-auto select-none bg-[#EFECE1]">
      {/* Blueprint Outer Caliper Dimension Stamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D3CDBC] pb-1 mb-2">
        <div className="flex items-center space-x-3">
          <span>DIM // 12.260</span>
          <span>•</span>
          <span>MULTIMODAL VAULT // SHA-256</span>
          <span>•</span>
          <span>GRID 8.00mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>CALIPER: 129 mm</span>
          <span>•</span>
          <span className="text-[#1D64EC] font-bold">PDF + SCAN_OCR</span>
          <span>•</span>
          <span>AXIS // 86.290</span>
        </div>
      </div>

      {/* Blueprint Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D3CDBC]">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider mb-1">
            <span>🌱</span>
            <span>MODULE 02.00</span>
            <span>{"//"}</span>
            <span>MULTIMODAL INGESTION VAULT</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414] uppercase">
            Document Ingestion &amp; Evidence Vault
          </h1>
          <p className="text-xs text-[#52524E] mt-0.5">
            Ingested contracts, leases, and agreements with cryptographic SHA-256 versioning and subword grounding.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/documents/doc-sample-01">
            <Button size="sm" variant="pill" className="space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]">
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Sample Document</span>
            </Button>
          </Link>
          <Button size="sm" variant="primary" className="space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics Console */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Ingested Documents (Cobalt Blue #1D64EC) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>INGESTED DOCUMENTS</span>
              <span className="text-[#1D64EC]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#1D64EC] leading-tight mt-1 tabular-nums">
              0{INGESTED_DOCS.length}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>100% Ingested</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">2 files</span>
          </div>
        </div>

        {/* Metric 2: Verified Spans (Royal Navy #0F4FC2) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>EXTRACTED CLAUSE FACTS</span>
              <span className="text-[#0F4FC2]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#0F4FC2] leading-tight mt-1 tabular-nums">
              12
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FCFAF7] border border-[#D1CCC0] text-[10px] font-mono text-[#141414]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F4FC2]" />
              <span>8 Grounded · 4 Extracted</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">12 spans</span>
          </div>
        </div>

        {/* Metric 3: System Extraction Quality (Charcoal Ink #141414 + Dual Progress) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>EXTRACTION PRECISION</span>
              <span>🌱</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#141414] leading-tight mt-1 tabular-nums">
              98.5%
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] space-y-1.5">
            <div className="flex items-center space-x-1 h-1.5 w-full bg-[#EDE9DD] rounded-full overflow-hidden">
              <div className="h-full bg-[#2BB673]" style={{ width: "98.5%" }} />
              <div className="h-full bg-[#E54837]" style={{ width: "1.5%" }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#52524E]">
              <span>Grounded: 98.5%</span>
              <span className="text-[#DE4A2B]">Uncertain: 1.5%</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Pending Flags (Coral Terracotta #DE4A2B) */}
        <div className="bg-[#FCEAE5] border-[1.5px] border-[#E57368] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#C93B2B] uppercase">
              <span>UNVERIFIED / REVIEW FLAGS</span>
              <span className="text-[#DE4A2B]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#DE4A2B] leading-tight mt-1 tabular-nums">
              01
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E57368]/40 flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E57368] text-[10px] font-mono text-[#C93B2B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              <span>FAILED • [RETRY REQUIRED]</span>
            </div>
            <span className="text-[10px] font-mono text-[#C93B2B] font-bold">1 FLAG</span>
          </div>
        </div>
      </div>

      {/* Document Ingestion Table */}
      <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)]">
        <div className="p-5 border-b border-[#D1CCC0] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center space-x-2">
            <Files className="w-4 h-4 text-[#141414]" />
            <h3 className="font-bold text-sm text-[#141414] uppercase tracking-tight">INGESTED AGREEMENT ARCHIVE</h3>
          </div>
          <div className="text-[11px] font-mono text-[#7A7871]">
            AXIS // X:1440 Y:900 • 38.300 mm
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EDE9DD] border-b border-[#D1CCC0] text-[10px] font-mono uppercase text-[#7A7871]">
              <tr>
                <th className="py-3 px-5">DOCUMENT IDENTIFIER</th>
                <th className="py-3 px-5">FORMAT</th>
                <th className="py-3 px-5">PAGES</th>
                <th className="py-3 px-5">SHA-256 HASH</th>
                <th className="py-3 px-5">FACTS</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1CCC0] bg-[#FFFFFF]">
              {INGESTED_DOCS.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#FCFAF7] transition-all">
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#1D64EC] shrink-0" />
                      <div>
                        <span className="font-bold text-[#141414] block">{doc.title}</span>
                        <span className="text-[10px] font-mono text-[#7A7871]">ID: {doc.id} • {doc.timestamp}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <Badge variant="outline" className="border-[#1E1E1E] font-mono text-[9px]">
                      {doc.format}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 font-mono text-[#141414]">{doc.pages} Pages</td>
                  <td className="py-4 px-5">
                    <code className="text-[10px] font-mono text-[#52524E] bg-[#EDE9DD] px-1.5 py-0.5 rounded border border-[#D1CCC0]">
                      {doc.sha256.substring(0, 16)}...
                    </code>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-mono font-bold text-[#1D64EC]">{doc.factsExtracted} Facts</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      <span>{doc.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Link href={`/documents/${doc.id}`}>
                      <Button size="sm" variant="secondary" className="space-x-1 text-xs font-mono border-[1.5px] border-[#1E1E1E]">
                        <span>Inspect Split-View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
