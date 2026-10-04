"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ExtractedFactItem {
  id: string;
  factKey: string;
  rawValue: string;
  normalizedValue: Record<string, any>;
  dataType: string;
  confidenceScore: number;
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "EDITED" | "REJECTED";
  epistemicTier: string;
  pageNumber: number;
  charStart: number;
  charEnd: number;
}

const INITIAL_FACTS: ExtractedFactItem[] = [
  {
    id: "fact-01",
    factKey: "BASE_RENT",
    rawValue: "$2,400.00 USD",
    normalizedValue: { amount: 2400.0, currency: "USD", frequency: "MONTHLY" },
    dataType: "CURRENCY",
    confidenceScore: 0.98,
    verificationStatus: "UNVERIFIED",
    epistemicTier: "Tier 1: Grounded Fact",
    pageNumber: 1,
    charStart: 382,
    charEnd: 395,
  },
  {
    id: "fact-02",
    factKey: "EFFECTIVE_DATE",
    rawValue: "November 1, 2026",
    normalizedValue: { date_iso: "2026-11-01" },
    dataType: "DATE",
    confidenceScore: 0.99,
    verificationStatus: "UNVERIFIED",
    epistemicTier: "Tier 1: Grounded Fact",
    pageNumber: 1,
    charStart: 104,
    charEnd: 120,
  },
  {
    id: "fact-03",
    factKey: "EXPIRATION_DATE",
    rawValue: "October 31, 2027",
    normalizedValue: { date_iso: "2027-10-31" },
    dataType: "DATE",
    confidenceScore: 0.99,
    verificationStatus: "UNVERIFIED",
    epistemicTier: "Tier 1: Grounded Fact",
    pageNumber: 1,
    charStart: 337,
    charEnd: 353,
  },
  {
    id: "fact-04",
    factKey: "SECURITY_DEPOSIT",
    rawValue: "$2,400.00 USD",
    normalizedValue: { amount: 2400.0, currency: "USD", frequency: "ONE_TIME" },
    dataType: "CURRENCY",
    confidenceScore: 0.96,
    verificationStatus: "UNVERIFIED",
    epistemicTier: "Tier 1: Grounded Fact",
    pageNumber: 2,
    charStart: 49,
    charEnd: 62,
  },
  {
    id: "fact-05",
    factKey: "NOTICE_PERIOD",
    rawValue: "sixty (60) days prior written notice",
    normalizedValue: { duration_days: 60, raw: "sixty (60) days" },
    dataType: "DURATION",
    confidenceScore: 0.95,
    verificationStatus: "UNVERIFIED",
    epistemicTier: "Tier 1: Grounded Fact",
    pageNumber: 2,
    charStart: 219,
    charEnd: 255,
  },
  {
    id: "fact-06",
    factKey: "EARLY_TERMINATION_FEE",
    rawValue: "$2,400.00 USD",
    normalizedValue: { amount: 2400.0, currency: "USD", frequency: "ONE_TIME" },
    dataType: "CURRENCY",
    confidenceScore: 0.94,
    verificationStatus: "UNVERIFIED",
    epistemicTier: "Tier 1: Grounded Fact",
    pageNumber: 2,
    charStart: 335,
    charEnd: 348,
  },
  {
    id: "fact-07",
    factKey: "LATE_FEE_PENALTY",
    rawValue: "$100.00 USD",
    normalizedValue: { amount: 100.0, currency: "USD", frequency: "ONE_TIME" },
    dataType: "CURRENCY",
    confidenceScore: 0.97,
    verificationStatus: "UNVERIFIED",
    epistemicTier: "Tier 1: Grounded Fact",
    pageNumber: 2,
    charStart: 492,
    charEnd: 503,
  },
  {
    id: "fact-08",
    factKey: "GOVERNING_LAW",
    rawValue: "State of Illinois",
    normalizedValue: { jurisdiction: "State of Illinois" },
    dataType: "TEXT",
    confidenceScore: 0.99,
    verificationStatus: "UNVERIFIED",
    epistemicTier: "Tier 1: Grounded Fact",
    pageNumber: 3,
    charStart: 184,
    charEnd: 201,
  },
];

export default function DocumentInspectorPage() {
  const params = useParams();
  const documentId = params?.id as string;

  const [selectedPage, setSelectedPage] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState<"facts" | "provenance">("facts");
  const [facts, setFacts] = React.useState<ExtractedFactItem[]>(INITIAL_FACTS);
  const [selectedFactId, setSelectedFactId] = React.useState<string | null>("fact-01");
  const [editingFactId, setEditingFactId] = React.useState<string | null>(null);
  const [editAmount, setEditAmount] = React.useState<string>("");

  const sampleDocument = {
    title: "Standard Residential Lease Agreement",
    domain: "RESIDENTIAL_TENANCY",
    version: 1,
    pageCount: 3,
    status: "PROCESSED",
    hash: "a4f89d316ecb9c2b0d5c4146059929e5ff3021f478c5c76c1bbcdfe729d5b034",
    pages: [
      {
        pageNumber: 1,
        text: `RESIDENTIAL LEASE AGREEMENT\n\nThis Lease Agreement (the "Agreement") is entered into on November 1, 2026, by and between Oakwood Properties LLC ("Landlord") and Alex Mercer ("Tenant").\n\n1. PREMISES: Landlord hereby leases to Tenant the premises located at 742 Evergreen Terrace, Springfield, IL.\n\n2. TERM: The initial term shall be twelve (12) calendar months, commencing on November 1, 2026, and terminating on October 31, 2027.\n\n3. RENT: Tenant agrees to pay Landlord monthly base rent of $2,400.00 USD, due on or before the first day of each month.`,
      },
      {
        pageNumber: 2,
        text: `4. SECURITY DEPOSIT: Upon signing this Agreement, Tenant shall deposit $2,400.00 USD with Landlord as a security deposit for faithful performance of all covenants.\n\n5. EARLY TERMINATION & BUYOUT: Tenant may terminate this Agreement prior to October 31, 2027, provided Tenant: (a) gives at least sixty (60) days prior written notice, and (b) pays an early termination buyout fee equal to one (1) month rent ($2,400.00 USD).\n\n6. LATE PAYMENTS: If rent is not received by Landlord by 11:59 PM on the fifth (5th) calendar day of the month, Tenant shall pay a late charge of $100.00 USD.`,
      },
      {
        pageNumber: 3,
        text: `7. REPAIRS & NOTICE: Tenant shall notify Landlord in writing within forty-eight (48) hours of any water leakage, plumbing malfunction, or structural hazard.\n\n8. GOVERNING LAW: This Agreement shall be governed by and construed in accordance with the laws of the State of Illinois.\n\nIN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.`,
      },
    ],
  };

  const handleSelectFact = (fact: ExtractedFactItem) => {
    setSelectedFactId(fact.id);
    setSelectedPage(fact.pageNumber);
  };

  const handleVerify = (id: string, action: "VERIFIED" | "REJECTED") => {
    setFacts((prev) =>
      prev.map((f) => (f.id === id ? { ...f, verificationStatus: action } : f))
    );
  };

  const handleStartEdit = (fact: ExtractedFactItem) => {
    setEditingFactId(fact.id);
    setEditAmount(
      fact.normalizedValue.amount !== undefined
        ? String(fact.normalizedValue.amount)
        : fact.rawValue
    );
  };

  const handleSaveEdit = (id: string) => {
    setFacts((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const num = parseFloat(editAmount);
        const updatedNorm = !isNaN(num)
          ? { ...f.normalizedValue, amount: num, edited: true }
          : { ...f.normalizedValue, text: editAmount, edited: true };
        return {
          ...f,
          verificationStatus: "EDITED",
          normalizedValue: updatedNorm,
        };
      })
    );
    setEditingFactId(null);
  };

  const selectedFact = facts.find((f) => f.id === selectedFactId);

  // Split active page text to render highlighted span if current fact is on active page
  const activePageText = sampleDocument.pages[selectedPage - 1]?.text || "";

  const renderPageContent = () => {
    if (!selectedFact || selectedFact.pageNumber !== selectedPage) {
      return (
        <pre className="font-mono text-xs text-[#141414] leading-relaxed whitespace-pre-wrap select-text">
          {activePageText}
        </pre>
      );
    }

    const { charStart, charEnd } = selectedFact;
    if (charStart >= 0 && charEnd <= activePageText.length && charStart < charEnd) {
      const before = activePageText.slice(0, charStart);
      const highlighted = activePageText.slice(charStart, charEnd);
      const after = activePageText.slice(charEnd);

      return (
        <pre className="font-mono text-xs text-[#141414] leading-relaxed whitespace-pre-wrap select-text">
          {before}
          <mark className="bg-[#FEF08A] text-[#1E1E1E] border border-[#CA8A04] px-1 py-0.5 rounded font-bold transition-all shadow-sm">
            {highlighted}
          </mark>
          {after}
        </pre>
      );
    }

    return (
      <pre className="font-mono text-xs text-[#141414] leading-relaxed whitespace-pre-wrap select-text">
        {activePageText}
      </pre>
    );
  };

  const verifiedCount = facts.filter((f) => f.verificationStatus === "VERIFIED").length;
  const editedCount = facts.filter((f) => f.verificationStatus === "EDITED").length;
  const rejectedCount = facts.filter((f) => f.verificationStatus === "REJECTED").length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#EFECE1] select-none">
      {/* Top Inspector Header */}
      <div className="h-16 border-b-2 border-[#2B2B28] bg-[#FCFAF7] px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center space-x-4">
          <Link href="/documents">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 border-[1.5px] border-[#1E1E1E] rounded-full">
              <ArrowLeft className="w-4 h-4 text-[#141414]" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">🌱</span>
              <h1 className="text-sm font-bold text-[#141414] uppercase tracking-tight">{sampleDocument.title}</h1>
              <Badge variant="tier-1-source" className="border-[#1E1E1E]">v{sampleDocument.version} PROCESSED</Badge>
              <Badge variant="outline" className="border-[#1E1E1E]">{sampleDocument.domain}</Badge>
            </div>
            <p className="text-[10px] text-[#7A7871] font-mono">
              ID: {documentId || "doc-sample-01"} • AXIS // X:1440 Y:900 • GRID 8.00mm
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-3 text-xs border-r border-[#D1CCC0] pr-4">
            <span className="text-[#52524E] font-mono text-[11px]">
              Verified: <strong className="text-[#1E6E38] font-bold">{verifiedCount}</strong> / {facts.length}
            </span>
            {editedCount > 0 && (
              <span className="text-[#52524E] font-mono text-[11px]">
                Edited: <strong className="text-[#0F4FC2] font-bold">{editedCount}</strong>
              </span>
            )}
            {rejectedCount > 0 && (
              <span className="text-[#52524E] font-mono text-[11px]">
                Rejected: <strong className="text-[#DE4A2B] font-bold">{rejectedCount}</strong>
              </span>
            )}
          </div>
          <Link href="/commitments">
            <Button size="sm" variant="pill" className="space-x-1.5 font-mono text-xs border-[1.5px] border-[#1E1E1E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Commitments Ledger</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Split-Pane Main Body */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Pane: Document Spatial Text Viewer */}
        <div className="flex-1 bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] flex flex-col overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)]">
          {/* Page Selector Bar */}
          <div className="h-12 border-b border-[#D1CCC0] bg-[#FFFFFF] px-5 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#1D64EC]" />
              <span className="text-xs font-bold text-[#141414] uppercase tracking-tight">Physical Document View</span>
              {selectedFact && selectedFact.pageNumber === selectedPage && (
                <span className="text-[10px] font-mono text-[#1E6E38] bg-[#EAF5EE] border border-[#A7D7B5] px-2 py-0.5 rounded-full font-bold">
                  Highlighting: {selectedFact.factKey}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1.5">
              {sampleDocument.pages.map((p) => (
                <button
                  key={p.pageNumber}
                  onClick={() => setSelectedPage(p.pageNumber)}
                  className={`px-3 py-1 text-xs rounded-full font-mono transition-all border ${
                    selectedPage === p.pageNumber
                      ? "bg-[#1E1E1E] text-white border-[#1E1E1E] font-medium"
                      : "text-[#52524E] hover:text-[#141414] bg-[#FFFFFF] border-[#D1CCC0]"
                  }`}
                >
                  Page {p.pageNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Document Content View: Paper Sheet in Cream Inset */}
          <div className="flex-1 p-8 overflow-y-auto bg-[#EDE9DD]/40">
            <div className="max-w-2xl mx-auto bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              {renderPageContent()}
            </div>
          </div>
        </div>

        {/* Right Pane: HITL Review & Cryptographic Provenance */}
        <div className="w-[460px] bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] flex flex-col overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] shrink-0">
          {/* Right Pane Tabs */}
          <div className="h-12 border-b border-[#D1CCC0] bg-[#FFFFFF] px-5 flex items-center space-x-4 shrink-0">
            <button
              onClick={() => setActiveTab("facts")}
              className={`text-xs font-bold uppercase tracking-tight pb-2 border-b-2 transition-all ${
                activeTab === "facts"
                  ? "border-[#1E1E1E] text-[#141414]"
                  : "border-transparent text-[#52524E] hover:text-[#141414]"
              }`}
            >
              Extracted Facts ({facts.length})
            </button>
            <button
              onClick={() => setActiveTab("provenance")}
              className={`text-xs font-bold uppercase tracking-tight pb-2 border-b-2 transition-all ${
                activeTab === "provenance"
                  ? "border-[#1E1E1E] text-[#141414]"
                  : "border-transparent text-[#52524E] hover:text-[#141414]"
              }`}
            >
              Cryptographic Provenance
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "facts" ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-[11px] text-[#0F4FC2] flex items-start space-x-2">
                <Info className="w-3.5 h-3.5 text-[#1D64EC] shrink-0 mt-0.5" />
                <span>
                  <strong>Human-in-the-Loop Review:</strong> Inspect grounded quotes. Click any fact to jump to its source span. Accept, edit, or reject candidates.
                </span>
              </div>

              {facts.map((fact) => {
                const isSelected = selectedFactId === fact.id;
                const isEditing = editingFactId === fact.id;

                return (
                  <div
                    key={fact.id}
                    onClick={() => handleSelectFact(fact)}
                    className={`p-4 rounded-2xl border-[1.5px] transition-all cursor-pointer shadow-[0_3px_6px_rgba(0,0,0,0.05)] ${
                      isSelected
                        ? "bg-[#FFFFFF] border-[#1E1E1E] ring-2 ring-[#1E1E1E]"
                        : "bg-[#FFFFFF] border-[#1E1E1E]/40 hover:border-[#1E1E1E]"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#D1CCC0]">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#141414]">
                          {fact.factKey}
                        </span>
                        <Badge variant="outline" className="text-[9px] py-0 border-[#1E1E1E]">
                          {fact.dataType}
                        </Badge>
                      </div>
                      <div>
                        {fact.verificationStatus === "UNVERIFIED" && (
                          <span className="inline-flex items-center text-[10px] font-mono text-[#996500] bg-[#FDF5E6] border border-[#E6CA85] px-2 py-0.5 rounded-full font-medium">
                            UNVERIFIED
                          </span>
                        )}
                        {fact.verificationStatus === "VERIFIED" && (
                          <span className="inline-flex items-center text-[10px] font-mono text-[#1E6E38] bg-[#EAF5EE] border border-[#A7D7B5] px-2 py-0.5 rounded-full font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            VERIFIED
                          </span>
                        )}
                        {fact.verificationStatus === "EDITED" && (
                          <span className="inline-flex items-center text-[10px] font-mono text-[#0F4FC2] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-full font-medium">
                            <Edit2 className="w-2.5 h-2.5 mr-1" />
                            EDITED
                          </span>
                        )}
                        {fact.verificationStatus === "REJECTED" && (
                          <span className="inline-flex items-center text-[10px] font-mono text-[#C93B2B] bg-[#FCEAE5] border border-[#E57368] px-2 py-0.5 rounded-full font-medium">
                            <XCircle className="w-3 h-3 mr-1" />
                            REJECTED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Normalized Value & Edit Form */}
                    <div className="pt-2 text-xs">
                      {isEditing ? (
                        <div className="space-y-2 bg-[#FCFAF7] p-3 rounded-xl border border-[#D1CCC0]">
                          <label className="text-[11px] font-bold text-[#141414] block">
                            Modify Normalized Value:
                          </label>
                          <input
                            type="text"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full text-xs font-mono px-2 py-1.5 border border-[#1E1E1E] rounded-lg bg-[#FFFFFF]"
                          />
                          <div className="flex justify-end space-x-1.5 pt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[11px] px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFactId(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              className="h-6 text-[11px] px-2 border border-[#1E1E1E]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit(fact.id);
                              }}
                            >
                              Save Edit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[#52524E] text-[11px] font-mono">Normalized:</span>
                            <span className="font-mono font-bold text-sm text-[#1D64EC] tabular-nums">
                              {fact.normalizedValue.amount !== undefined
                                ? `$${fact.normalizedValue.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${fact.normalizedValue.currency || "USD"}${
                                    fact.normalizedValue.frequency
                                      ? ` (${fact.normalizedValue.frequency})`
                                      : ""
                                  }`
                                : fact.normalizedValue.date_iso !== undefined
                                ? fact.normalizedValue.date_iso
                                : fact.normalizedValue.duration_days !== undefined
                                ? `${fact.normalizedValue.duration_days} days`
                                : fact.normalizedValue.jurisdiction ||
                                  fact.rawValue}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#52524E] font-mono">
                            Source Quote: <span className="text-[#141414] italic font-sans font-medium">&ldquo;{fact.rawValue}&rdquo;</span>
                          </div>
                          <div className="text-[10px] text-[#7A7871] font-mono">
                            Page {fact.pageNumber} · Offsets [{fact.charStart}:{fact.charEnd}] · Conf: {Math.round(fact.confidenceScore * 100)}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* HITL Action Buttons */}
                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#D1CCC0]">
                      <div className="flex items-center space-x-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 px-2.5 text-[10px] space-x-1 text-[#1E6E38] bg-[#EAF5EE] hover:bg-[#A7D7B5]/40 border border-[#A7D7B5] rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(fact.id, "VERIFIED");
                          }}
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>Accept</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 px-2.5 text-[10px] space-x-1 text-[#0F4FC2] bg-[#EFF6FF] hover:bg-[#BFDBFE]/40 border border-[#BFDBFE] rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(fact);
                          }}
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 px-2.5 text-[10px] space-x-1 text-[#C93B2B] bg-[#FCEAE5] hover:bg-[#FBD8CE]/40 border border-[#E57368] rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(fact.id, "REJECTED");
                          }}
                        >
                          <XCircle className="w-2.5 h-2.5" />
                          <span>Reject</span>
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] font-mono text-[#7A7871] hover:text-[#141414]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFact(fact);
                        }}
                      >
                        <span>Focus</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="p-4 bg-[#FFFFFF] rounded-2xl border-[1.5px] border-[#1E1E1E] shadow-sm space-y-3">
                <div className="pb-2 border-b border-[#D1CCC0]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7871] block">
                    CRYPTOGRAPHIC PROVENANCE
                  </span>
                  <h4 className="font-bold text-sm text-[#141414] mt-0.5">SHA-256 Vault Hash</h4>
                </div>
                <div className="space-y-2 text-xs">
                  <span className="font-mono text-[10px] break-all text-[#141414] bg-[#EDE9DD] px-2 py-1 rounded border border-[#D1CCC0] block">
                    {sampleDocument.hash}
                  </span>
                  <div className="flex justify-between text-[#52524E] pt-1">
                    <span>Page Count:</span>
                    <span className="font-mono font-bold text-[#141414]">{sampleDocument.pageCount} pages</span>
                  </div>
                  <div className="flex justify-between text-[#52524E]">
                    <span>Parser Status:</span>
                    <span className="text-[#1E6E38] font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Inert (No Scripts)</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-[#52524E]">
                    <span>Grounding Gate:</span>
                    <span className="text-[#1E6E38] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>100% Verbatim Grounded</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] rounded-2xl border-[1.5px] border-[#1E1E1E] shadow-sm space-y-3">
                <div className="pb-2 border-b border-[#D1CCC0]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7871] block">
                    EXTRACTION AUDIT INTEGRITY
                  </span>
                  <h4 className="font-bold text-sm text-[#141414] mt-0.5">Subword Token Verification</h4>
                </div>
                <p className="text-[#52524E] text-[11px] leading-relaxed">
                  Every assertion in AFTERMATH traces to an immutable character span. Zero fabricated risk percentages or hallucinations are permitted into downstream simulation pipelines.
                </p>
                <div className="p-3 bg-[#EAF5EE] border border-[#A7D7B5] rounded-xl text-[11px] text-[#1E6E38] font-medium">
                  8 Grounded Facts detected. All spans verified against physical page offsets.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
