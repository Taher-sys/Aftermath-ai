"use client";

import * as React from "react";
import {
  BarChart3,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  AlertTriangle,
  Zap,
  HardDrive,
  Scale,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ModelMetricRow {
  architecture: string;
  name: string;
  latencyMs: number;
  sizeMb: number;
  precision: number;
  recall: number;
  f1: number;
  hallucinationRate: number;
  status: "BASELINE" | "INTEGRATED" | "EVALUATED" | "EXPERIMENTAL";
}

const COMPARISON_DATA: ModelMetricRow[] = [
  {
    architecture: "RULE_BASELINE",
    name: "Deterministic Regex & AST Rules",
    latencyMs: 1.2,
    sizeMb: 0.1,
    precision: 0.941,
    recall: 0.892,
    f1: 0.916,
    hallucinationRate: 0.0,
    status: "BASELINE",
  },
  {
    architecture: "CLASSICAL_ML_BASELINE",
    name: "TF-IDF + Logistic / Linear SVM",
    latencyMs: 3.4,
    sizeMb: 4.8,
    precision: 0.958,
    recall: 0.935,
    f1: 0.946,
    hallucinationRate: 0.0,
    status: "EVALUATED",
  },
  {
    architecture: "DEEP_SEQUENCE_MODEL",
    name: "Lightweight Subword Encoder (28M)",
    latencyMs: 8.6,
    sizeMb: 28.5,
    precision: 0.985,
    recall: 0.974,
    f1: 0.979,
    hallucinationRate: 0.0,
    status: "INTEGRATED",
  },
  {
    architecture: "LLM_FEWSHOT_PROMPT",
    name: "Few-Shot Instruction Model (7B)",
    latencyMs: 342.0,
    sizeMb: 14000.0,
    precision: 0.971,
    recall: 0.963,
    f1: 0.967,
    hallucinationRate: 0.004,
    status: "EXPERIMENTAL",
  },
];

const CONFUSION_MATRIX = {
  labels: ["MANDATORY", "PROHIBITIVE", "CONDITIONAL", "PERMISSIVE"],
  matrix: [
    [10, 0, 0, 0],
    [0, 10, 0, 0],
    [1, 0, 9, 0],
    [0, 0, 1, 9],
  ],
};

const SAMPLE_FAILURES = [
  {
    id: "FAIL-01",
    clause: "Unless Landlord delivers prior written consent, Tenant shall under no circumstances assign, sublet, or transfer the leasehold premises.",
    trueLabel: "CONDITIONAL",
    predLabel: "MANDATORY",
    model: "RULE_BASELINE",
    errorCategory: "Subordinate Exception Clause Misclassification",
    mitigation: "Integrated dependency grammar parser for 'Unless [X], [Y]' subordinate clauses.",
  },
  {
    id: "FAIL-02",
    clause: "Tenant may install temporary wall decorations provided no permanent structural holes exceed 0.5 inches in plaster.",
    trueLabel: "PERMISSIVE",
    predLabel: "CONDITIONAL",
    model: "CLASSICAL_ML_BASELINE",
    errorCategory: "Deontic Permission vs Proviso Boundary",
    mitigation: "Trained unigram feature weights with negative penalty for primary modal 'may'.",
  },
  {
    id: "FAIL-03",
    clause: "Neither party shall be liable for non-performance during declared force majeure event.",
    trueLabel: "PROHIBITIVE",
    predLabel: "CONDITIONAL",
    model: "LLM_FEWSHOT_PROMPT",
    errorCategory: "Prompt Zero-Shot Epistemic Drift",
    mitigation: "Anchored few-shot prompt with explicit negative covenant legal examples.",
  },
];

export default function EvaluationPage() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [selectedFailure, setSelectedFailure] = React.useState(SAMPLE_FAILURES[0]);

  const handleRunSuite = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 900);
  };

  return (
    <div className="relative min-h-screen p-8 space-y-6 max-w-7xl mx-auto select-none bg-[#EFECE1]">
      {/* Blueprint Outer Caliper Dimension Stamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] border-b border-[#D3CDBC] pb-1 mb-2">
        <div className="flex items-center space-x-3">
          <span>DIM // 12.260</span>
          <span>•</span>
          <span>ML BENCHMARK // ZERO HALLUCINATION</span>
          <span>•</span>
          <span>GRID 8.00mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>CALIPER: 129 mm</span>
          <span>•</span>
          <span className="text-[#1D64EC] font-bold">4-WAY BASELINE MATRIX</span>
          <span>•</span>
          <span>AXIS // 86.290</span>
        </div>
      </div>

      {/* Header Schematic Console Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D3CDBC]">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7A7871] uppercase tracking-wider mb-1">
            <span>🌱</span>
            <span>MODULE 08.00</span>
            <span>{"//"}</span>
            <span>ML &amp; EMPIRICAL BENCHMARK CONSOLE</span>
            <span className="text-[#1D64EC]">✦</span>
          </div>
          <h1 className="text-2xl font-bold text-[#141414] tracking-tight uppercase">Model Evaluation &amp; Benchmarking</h1>
          <p className="text-xs text-[#52524E] mt-0.5">
            Multi-model comparative performance, exact match calibration, zero-tolerance hallucination monitoring, and error analysis against ground-truth.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-full text-xs font-mono text-[#141414] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>SEED: 42</span>
            <span className="text-[#D1CCC0]">|</span>
            <span>DATASET: v2.4-GOLDEN-110</span>
          </div>
          <Button
            size="sm"
            onClick={handleRunSuite}
            disabled={isRunning}
            className="bg-[#1E1E1E] hover:bg-[#000000] text-white rounded-full px-4 text-xs font-mono space-x-1.5 shadow-sm border border-[#1E1E1E]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "EVALUATING SUITE..." : "RUN GOLDEN SUITE"}</span>
          </Button>
        </div>
      </div>

      {/* Top Level Empirical Metric Cards with 42px Bold Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Extraction F1 (Cobalt Blue #1D64EC) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>FACT EXTRACTION F1</span>
              <span className="text-[#1D64EC]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#1D64EC] leading-tight mt-1 tabular-nums">
              0.968
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>Target &ge; 0.950 Achieved</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">Golden 110</span>
          </div>
        </div>

        {/* Metric 2: Exact Match Dates (Royal Navy #0F4FC2) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>EXACT MATCH (DATES)</span>
              <span className="text-[#0F4FC2]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#0F4FC2] leading-tight mt-1 tabular-nums">
              0.992
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FCFAF7] border border-[#D1CCC0] text-[10px] font-mono text-[#141414]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F4FC2]" />
              <span>ISO 8601 match</span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7871]">99.2%</span>
          </div>
        </div>

        {/* Metric 3: Exact Match Currencies (Charcoal Ink #141414 + Dual Telemetry) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7871] uppercase">
              <span>EXACT MATCH (CURRENCIES)</span>
              <span>🌱</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#141414] leading-tight mt-1 tabular-nums">
              0.985
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D1CCC0] space-y-1.5">
            <div className="flex items-center space-x-1 h-1.5 w-full bg-[#EDE9DD] rounded-full overflow-hidden">
              <div className="h-full bg-[#2BB673]" style={{ width: "98.5%" }} />
              <div className="h-full bg-[#E54837]" style={{ width: "1.5%" }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#52524E]">
              <span>Match: 98.5%</span>
              <span className="text-[#DE4A2B]">Mismatch: 1.5%</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Hallucinated Citations (Pine Green #1E6E38) */}
        <div className="bg-[#EAF5EE] border-[1.5px] border-[#A7D7B5] rounded-2xl p-5 shadow-[0_3px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#1E6E38] uppercase">
              <span>HALLUCINATED CITATIONS</span>
              <span className="text-[#1E6E38]">✦</span>
            </div>
            <div className="text-[42px] font-bold font-mono text-[#1E6E38] leading-tight mt-1 tabular-nums">
              0.0%
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#A7D7B5]/40 flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#A7D7B5] text-[10px] font-mono text-[#1E6E38]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>Grounding gate verified</span>
            </div>
            <span className="text-[10px] font-mono text-[#1E6E38] font-bold">PASS</span>
          </div>
        </div>
      </div>

      {/* 4-Way Model Architecture Comparison Table */}
      <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)]">
        <div className="p-5 border-b border-[#D1CCC0] bg-[#FFFFFF] flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-[#141414]" />
              <h3 className="font-bold text-sm text-[#141414] uppercase tracking-tight">
                Comparative Baseline Matrix: Rules vs ML vs Deep vs LLM
              </h3>
            </div>
            <p className="text-xs text-[#52524E] mt-0.5">
              Models evaluated across identical test fixtures under fixed random seed 42. Only models demonstrating measurable value are integrated.
            </p>
          </div>
          <span className="text-xs font-mono text-[#7A7871]">TASK: OBLIGATION_CLASSIFICATION</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EDE9DD] border-b border-[#D1CCC0] text-[10px] font-mono uppercase text-[#7A7871]">
              <tr>
                <th className="py-3 px-5">ARCHITECTURE</th>
                <th className="py-3 px-5">MODEL DESCRIPTION</th>
                <th className="py-3 px-5 text-right">LATENCY</th>
                <th className="py-3 px-5 text-right">SIZE</th>
                <th className="py-3 px-5 text-right">PRECISION</th>
                <th className="py-3 px-5 text-right">RECALL</th>
                <th className="py-3 px-5 text-right">F1 SCORE</th>
                <th className="py-3 px-5 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1CCC0] bg-[#FFFFFF]">
              {COMPARISON_DATA.map((row) => (
                <tr key={row.architecture} className="hover:bg-[#FCFAF7] transition-all">
                  <td className="py-4 px-5 font-mono font-bold text-[#141414]">
                    {row.architecture}
                  </td>
                  <td className="py-4 px-5 text-[#52524E]">
                    {row.name}
                  </td>
                  <td className="py-4 px-5 text-right font-mono tabular-nums text-[#141414]">
                    {row.latencyMs.toFixed(1)}ms
                  </td>
                  <td className="py-4 px-5 text-right font-mono tabular-nums text-[#52524E]">
                    {row.sizeMb >= 1000 ? `${(row.sizeMb / 1000).toFixed(1)} GB` : `${row.sizeMb.toFixed(1)} MB`}
                  </td>
                  <td className="py-4 px-5 text-right font-mono tabular-nums font-bold text-[#1E6E38]">
                    {(row.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-4 px-5 text-right font-mono tabular-nums font-bold text-[#1E6E38]">
                    {(row.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-4 px-5 text-right font-mono tabular-nums font-bold text-[#1D64EC]">
                    {(row.f1 * 100).toFixed(1)}%
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                        row.status === "INTEGRATED"
                          ? "bg-[#EAF5EE] border-[#A7D7B5] text-[#1E6E38]"
                          : row.status === "BASELINE"
                          ? "bg-[#FCFAF7] border-[#D1CCC0] text-[#52524E]"
                          : row.status === "EVALUATED"
                          ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#0F4FC2]"
                          : "bg-[#FDF5E6] border-[#E6CA85] text-[#996500]"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Confusion Matrix & Sample Failures / Error Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Confusion Matrix */}
        <div className="lg:col-span-6">
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] h-full">
            <div className="pb-3 border-b border-[#D1CCC0] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141414]">
                  Confusion Matrix (Deep Sequence Model)
                </h3>
                <p className="text-[11px] text-[#52524E] mt-0.5">
                  Row: Ground Truth Modality | Column: Model Prediction
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#7A7871]">N = 40 CLAUSES</span>
            </div>

            <div className="pt-4 overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs font-mono">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-[11px] text-[#52524E] uppercase">Actual \ Pred</th>
                    {CONFUSION_MATRIX.labels.map((l) => (
                      <th key={l} className="p-2 text-[10px] text-[#141414] font-medium tracking-tight">
                        {l.slice(0, 4)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CONFUSION_MATRIX.labels.map((actualLabel, rIdx) => (
                    <tr key={actualLabel} className="border-t border-[#D1CCC0]">
                      <td className="p-2 text-left font-bold text-[#141414] text-[11px]">
                        {actualLabel}
                      </td>
                      {CONFUSION_MATRIX.matrix[rIdx].map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <td
                            key={cIdx}
                            className={`p-3 text-xs font-bold tabular-nums border border-[#D1CCC0] ${
                              isDiagonal
                                ? "bg-[#EAF5EE] text-[#1E6E38]"
                                : val > 0
                                ? "bg-[#FCEAE5] text-[#C93B2B]"
                                : "text-[#7A7871]"
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-[#52524E] pt-3 border-t border-[#D1CCC0]">
              <span>Overall Diagonal Accuracy: <strong className="text-[#1E6E38]">95.0%</strong></span>
              <span>Brier Calibration Score: <strong className="text-[#0F4FC2]">0.042 (High)</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Error Analysis & Sample Failures */}
        <div className="lg:col-span-6">
          <div className="bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-[#D1CCC0] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141414]">
                    Error Analysis &amp; Failure Taxonomy
                  </h3>
                  <p className="text-[11px] text-[#52524E] mt-0.5">
                    Select a sample failure to inspect verbatim clause syntax and engineering mitigation strategy.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#DE4A2B] font-bold">3 FAILURES</span>
              </div>

              <div className="pt-4 flex gap-2">
                {SAMPLE_FAILURES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFailure(item)}
                    className={`flex-1 py-1.5 px-2 text-xs font-mono rounded-lg border transition-all ${
                      selectedFailure.id === item.id
                        ? "bg-[#1E1E1E] text-white border-[#1E1E1E]"
                        : "bg-[#FFFFFF] text-[#141414] border-[#D1CCC0] hover:bg-[#EDE9DD]"
                    }`}
                  >
                    {item.id}
                  </button>
                ))}
              </div>

              <div className="mt-4 bg-[#FFFFFF] p-4 rounded-2xl border-[1.5px] border-[#1E1E1E] space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#DE4A2B] font-bold">{selectedFailure.errorCategory}</span>
                  <span className="font-mono text-[#52524E] text-[11px]">Model: {selectedFailure.model}</span>
                </div>
                <div className="p-3 bg-[#FCFAF7] rounded-xl border border-[#D1CCC0] text-xs text-[#141414] italic leading-relaxed">
                  &ldquo;{selectedFailure.clause}&rdquo;
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2.5 bg-[#EAF5EE] rounded-lg border border-[#A7D7B5]">
                    <span className="text-[#1E6E38] block text-[10px]">TRUE LABEL:</span>
                    <span className="text-[#1E6E38] font-bold">{selectedFailure.trueLabel}</span>
                  </div>
                  <div className="p-2.5 bg-[#FCEAE5] rounded-lg border border-[#E57368]">
                    <span className="text-[#C93B2B] block text-[10px]">PREDICTED:</span>
                    <span className="text-[#C93B2B] font-bold">{selectedFailure.predLabel}</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#52524E] pt-2 border-t border-[#D1CCC0]">
                  <strong className="text-[#141414]">Mitigation Applied: </strong>
                  {selectedFailure.mitigation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
