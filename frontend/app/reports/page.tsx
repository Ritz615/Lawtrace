"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { FileText, Download, FileDown, Eye, Search, Filter } from "lucide-react";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { reportsApi } from "@/lib/api";
import type { RiskLevel } from "@/types";

const mockReports = [
  { docId: "1", name: "ServiceAgreement_Acme.pdf",    date: "Aug 5, 2026", risk: "high"   as RiskLevel, score: 78, type: "Service Agreement",  pages: 8 },
  { docId: "2", name: "NDA_TechPartner_v2.docx",      date: "Aug 3, 2026", risk: "medium" as RiskLevel, score: 45, type: "NDA",                 pages: 4 },
  { docId: "3", name: "EmployeeAgreement_2026.pdf",   date: "Aug 1, 2026", risk: "low"    as RiskLevel, score: 18, type: "Employment Agreement", pages: 12 },
  { docId: "4", name: "PartnershipAgreement.docx",    date: "Jul 25, 2026", risk: "low"   as RiskLevel, score: 22, type: "Partnership",          pages: 6 },
  { docId: "5", name: "FreelanceContract_Design.pdf", date: "Jul 20, 2026", risk: "critical" as RiskLevel, score: 91, type: "Freelance",        pages: 3 },
];

const riskColor = { low: "#10b981", medium: "#f59e0b", high: "#ef4444", critical: "#dc2626" };

export default function ReportsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockReports.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Reports">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="report-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports…"
              className="w-full pl-9 pr-4 py-2 bg-secondary/60 border border-input rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-input text-sm hover:bg-secondary transition-colors">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Reports", value: mockReports.length },
            { label: "High / Critical", value: mockReports.filter((r) => r.risk === "high" || r.risk === "critical").length },
            { label: "Avg Risk Score", value: Math.round(mockReports.reduce((a, r) => a + r.score, 0) / mockReports.length) },
            { label: "PDF Downloads", value: "24" },
          ].map((s) => (
            <div key={s.label} className="kpi-card text-center py-3">
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Reports list */}
        <div className="space-y-3">
          {filtered.map((report, i) => (
            <motion.div
              key={report.docId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4 flex-wrap">
                {/* Risk ring */}
                <div className="relative flex-shrink-0">
                  <svg width="52" height="52">
                    <circle cx="26" cy="26" r="22" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                    <circle
                      cx="26" cy="26" r="22" fill="none"
                      stroke={riskColor[report.risk]}
                      strokeWidth="4"
                      strokeDasharray={`${(report.score / 100) * 138} 138`}
                      strokeLinecap="round"
                      transform="rotate(-90 26 26)"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{report.score}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{report.name}</p>
                    <RiskBadge level={report.risk} />
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{report.type}</span>
                    <span>·</span>
                    <span>{report.date}</span>
                    <span>·</span>
                    <span>{report.pages} pages</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`/ai/analyze?id=${report.docId}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm hover:bg-secondary transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </a>
                  <a
                    href={reportsApi.downloadPdf(report.docId)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm hover:bg-secondary transition-colors"
                  >
                    <FileDown className="h-3.5 w-3.5" /> PDF
                  </a>
                  <a
                    href={reportsApi.downloadDocx(report.docId)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm hover:bg-primary/20 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> DOCX
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
