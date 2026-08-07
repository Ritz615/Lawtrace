"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { FileText, ArrowLeftRight, Plus, Minus, Edit3, TrendingUp, TrendingDown, Minus as MinusIcon } from "lucide-react";
import type { RiskLevel } from "@/types";

const mockDocs = [
  { id: "1", name: "NDA_v1.pdf", risk: "medium" as RiskLevel, date: "Jul 10, 2026" },
  { id: "2", name: "NDA_v2.pdf", risk: "low" as RiskLevel, date: "Aug 1, 2026" },
  { id: "3", name: "ServiceAgreement_Acme.pdf", risk: "high" as RiskLevel, date: "Aug 5, 2026" },
];

const mockDiff = {
  summary: "NDA v2 significantly improves terms: liability capped, penalty reduced, and IP clause added. Overall risk decreased from MEDIUM to LOW.",
  total_differences: 12,
  added: [
    { clause: "IP Ownership", text: "All intellectual property developed during the engagement shall be owned by the Client upon full payment." },
    { clause: "Force Majeure", text: "Neither party shall be liable for delays caused by circumstances beyond their reasonable control." },
    { clause: "Dispute Resolution", text: "Parties agree to mediation before arbitration or litigation." },
  ],
  removed: [
    { clause: "Unlimited Liability", text: "Provider shall be liable for all damages arising from the services." },
    { clause: "Unilateral Amendment", text: "Provider reserves the right to amend these terms at any time without notice." },
  ],
  modified: [
    { clause: "Termination Notice", before: "30 days written notice", after: "14 days written notice", risk_change: "decreased" as const },
    { clause: "Penalty", before: "15% of remaining contract value", after: "5% of remaining contract value", risk_change: "decreased" as const },
    { clause: "Payment Terms", before: "Net 60 days", after: "Net 30 days", risk_change: "increased" as const },
    { clause: "Confidentiality Period", before: "2 years post-contract", after: "5 years post-contract", risk_change: "unchanged" as const },
    { clause: "Governing Law", before: "State of Texas", after: "State of California", risk_change: "unchanged" as const },
  ],
};

type DiffTab = "all" | "added" | "removed" | "modified";

export default function ComparePage() {
  const [docA, setDocA] = useState(mockDocs[0]);
  const [docB, setDocB] = useState(mockDocs[1]);
  const [compared, setCompared] = useState(false);
  const [tab, setTab] = useState<DiffTab>("all");

  const riskIcon = {
    increased: <TrendingUp className="h-3.5 w-3.5 text-red-500" />,
    decreased: <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />,
    unchanged: <MinusIcon className="h-3.5 w-3.5 text-muted-foreground" />,
  };

  return (
    <AppShell title="Contract Comparison">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Selector */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Select Two Contracts to Compare</h2>
          <div className="grid md:grid-cols-5 gap-4 items-center">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Document A</label>
              <div className="space-y-2">
                {mockDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDocA(d)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                      ${docA.id === d.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                  >
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.date}</p>
                    </div>
                    <RiskBadge level={d.risk} />
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-1 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">VS</span>
              <button
                id="compare-btn"
                onClick={() => setCompared(true)}
                disabled={docA.id === docB.id}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-40"
              >
                Compare
              </button>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Document B</label>
              <div className="space-y-2">
                {mockDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDocB(d)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                      ${docB.id === d.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                  >
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.date}</p>
                    </div>
                    <RiskBadge level={d.risk} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {compared && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Summary */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{mockDiff.summary}</p>
                <div className="flex gap-4 mt-4 flex-wrap">
                  {[
                    { label: "Added", count: mockDiff.added.length, icon: Plus, color: "emerald" },
                    { label: "Modified", count: mockDiff.modified.length, icon: Edit3, color: "amber" },
                    { label: "Removed", count: mockDiff.removed.length, icon: Minus, color: "red" },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setTab(s.label.toLowerCase() as DiffTab)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                        bg-${s.color}-500/10 text-${s.color}-600 border-${s.color}-500/20
                        hover:bg-${s.color}-500/20`}
                    >
                      <s.icon className="h-4 w-4" />
                      {s.count} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {(["all", "added", "removed", "modified"] as DiffTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize
                      ${tab === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Diff cards */}
              <div className="space-y-3">
                {(tab === "all" || tab === "added") && mockDiff.added.map((item, i) => (
                  <motion.div key={`add-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">{item.clause}</span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">Added</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </motion.div>
                ))}

                {(tab === "all" || tab === "removed") && mockDiff.removed.map((item, i) => (
                  <motion.div key={`rem-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Minus className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-600">{item.clause}</span>
                      <span className="text-xs bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full">Removed</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-through">{item.text}</p>
                  </motion.div>
                ))}

                {(tab === "all" || tab === "modified") && mockDiff.modified.map((item, i) => (
                  <motion.div key={`mod-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Edit3 className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold text-amber-600">{item.clause}</span>
                      <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">Modified</span>
                      <div className="ml-auto flex items-center gap-1">
                        {riskIcon[item.risk_change]}
                        <span className="text-xs text-muted-foreground capitalize">{item.risk_change}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                        <p className="text-xs text-red-500 font-medium mb-1">{docA.name}</p>
                        <p className="text-sm text-muted-foreground line-through">{item.before}</p>
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                        <p className="text-xs text-emerald-500 font-medium mb-1">{docB.name}</p>
                        <p className="text-sm">{item.after}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
