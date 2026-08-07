"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { FileText, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronRight, Download, MessageSquare, Zap } from "lucide-react";
import type { RiskLevel } from "@/types";

// Mock data — replace with API in Phase 3
const mockReport = {
  filename: "ServiceAgreement_Acme.pdf",
  risk_score: 78,
  risk_level: "high" as RiskLevel,
  contract_type: "Service Agreement",
  parties: ["Acme Corporation (Client)", "TechVentures Inc (Provider)"],
  effective_date: "2026-01-15",
  expiration_date: "2027-01-14",
  executive_summary: "This Service Agreement establishes a 12-month software development engagement between Acme Corporation and TechVentures Inc at $15,000/month. The agreement contains several HIGH RISK clauses including unlimited liability provisions and lacks an IP ownership clause, which could expose the client to significant legal and financial risk.",
  clauses: {
    payment_terms: "Payment of $15,000 due within 30 days of invoice.",
    termination: "Either party may terminate with 30 days written notice. Early termination incurs 15% penalty.",
    confidentiality: "Both parties agree to maintain confidentiality for 3 years post-contract.",
    liability: "Provider's liability is unlimited for direct damages.",
    governing_law: "Governed by the laws of the State of California.",
    renewal: null,
    ip: null,
    arbitration: "Disputes resolved by arbitration in San Francisco, CA.",
    penalty: "15% of remaining contract value for early termination.",
    notice_period: "30 days written notice required for termination.",
    force_majeure: null,
  },
  key_risks: [
    "Unlimited liability clause exposes client to unbounded risk",
    "No IP ownership clause — deliverables may belong to provider",
    "15% early termination penalty is above market standard",
  ],
  missing_clauses: ["IP Ownership / Assignment", "Force Majeure", "Renewal Clause"],
  recommendations: [
    "Add IP assignment clause granting client full ownership of deliverables",
    "Cap liability at 2x contract value (industry standard)",
    "Negotiate termination penalty down to 5-10%",
    "Add force majeure clause for business continuity",
  ],
};

const clauseStatus = (val: string | null) =>
  val ? "present" : "missing";

function ClauseRow({ label, value }: { label: string; value: string | null }) {
  const [open, setOpen] = useState(false);
  const present = !!value;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => present && setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
      >
        {present
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
        <span className="flex-1 text-sm font-medium">{label}</span>
        {present
          ? (open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />)
          : <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">Missing</span>}
      </button>
      <AnimatePresence>
        {open && value && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-3 text-sm text-muted-foreground border-t border-border pt-2">{value}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const clauseLabels: Record<string, string> = {
  payment_terms: "Payment Terms", termination: "Termination", confidentiality: "Confidentiality",
  liability: "Liability", governing_law: "Governing Law", renewal: "Renewal Clause",
  ip: "IP Ownership", arbitration: "Arbitration", penalty: "Penalty Clause",
  notice_period: "Notice Period", force_majeure: "Force Majeure",
};

export default function AIAnalyzePage() {
  const r = mockReport;
  const riskColor = { low: "#10b981", medium: "#f59e0b", high: "#ef4444", critical: "#dc2626" }[r.risk_level];

  return (
    <AppShell title="AI Contract Analysis">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{r.filename}</h1>
              <p className="text-sm text-muted-foreground">{r.contract_type} · {r.parties[0]?.split("(")[0].trim()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/ai/chat" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm transition-colors">
              <MessageSquare className="h-4 w-4" /> Chat with AI
            </a>
            <button className="btn-primary flex items-center gap-2 py-2">
              <Download className="h-4 w-4" /> Download Report
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Risk + Summary */}
          <div className="lg:col-span-1 space-y-4">
            {/* Risk Score */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-semibold mb-4">Risk Score</h2>
              <div className="relative">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-5xl font-black" style={{ color: riskColor }}>{r.risk_score}</span>
                  <span className="text-muted-foreground text-sm mb-1">/ 100</span>
                </div>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.risk_score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: riskColor }}
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <RiskBadge level={r.risk_level} showIcon size="md" />
                </div>
              </div>
            </div>

            {/* Key Info */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold">Contract Details</h2>
              {[
                { label: "Effective Date", value: r.effective_date },
                { label: "Expiration", value: r.expiration_date },
                { label: "Type", value: r.contract_type },
                ...r.parties.map((p, i) => ({ label: `Party ${i + 1}`, value: p })),
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-right max-w-[55%] truncate">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Key Risks */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
              <h2 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Key Risks
              </h2>
              <ul className="space-y-2">
                {r.key_risks.map((risk, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Clauses + Recs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Executive Summary */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Executive Summary
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.executive_summary}</p>
            </div>

            {/* Clauses */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-semibold mb-4">
                Extracted Clauses
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({Object.values(r.clauses).filter(Boolean).length}/{Object.keys(r.clauses).length} found)
                </span>
              </h2>
              <div className="space-y-2">
                {Object.entries(r.clauses).map(([key, val]) => (
                  <ClauseRow key={key} label={clauseLabels[key] ?? key} value={val} />
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-semibold mb-3 text-emerald-500">💡 Recommendations</h2>
              <div className="space-y-2">
                {r.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-sm">
                    <span className="text-emerald-500 font-bold flex-shrink-0">{i + 1}.</span>
                    <span className="text-muted-foreground">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing clauses */}
            {r.missing_clauses.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                <h2 className="font-semibold text-amber-500 mb-3">⚠ Missing Clauses</h2>
                <div className="flex flex-wrap gap-2">
                  {r.missing_clauses.map((c) => (
                    <span key={c} className="text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3 py-1 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
