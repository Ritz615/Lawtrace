"use client";

import { motion } from "framer-motion";
import {
  FileText, AlertTriangle, Clock, CheckCircle2, Upload,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { RiskBadge } from "@/components/ui/RiskBadge";
import type { RiskLevel } from "@/types";

const uploadData = [
  { month: "Mar", uploads: 18 }, { month: "Apr", uploads: 24 },
  { month: "May", uploads: 31 }, { month: "Jun", uploads: 28 },
  { month: "Jul", uploads: 42 }, { month: "Aug", uploads: 35 },
];

const riskData = [
  { name: "Low",      value: 45, color: "#10b981" },
  { name: "Medium",   value: 30, color: "#f59e0b" },
  { name: "High",     value: 18, color: "#ef4444" },
  { name: "Critical", value: 7,  color: "#dc2626" },
];

const recentDocs = [
  { name: "ServiceAgreement_Acme.pdf",     risk: "high"   as RiskLevel, time: "2h ago",  status: "analyzed" },
  { name: "NDA_TechPartner_v2.docx",       risk: "medium" as RiskLevel, time: "5h ago",  status: "analyzed" },
  { name: "EmployeeAgreement_2026.pdf",    risk: "low"    as RiskLevel, time: "1d ago",  status: "analyzed" },
  { name: "RentalContract_Office.pdf",     risk: "medium" as RiskLevel, time: "2d ago",  status: "processing" },
];

const deadlines = [
  { doc: "NDA with Acme Corp",       days: 7,  level: "high"   as RiskLevel },
  { doc: "Service Agreement renewal", days: 14, level: "medium" as RiskLevel },
  { doc: "Employment contract review",days: 21, level: "low"    as RiskLevel },
];

const kpiCards = [
  { label: "Total Contracts", value: "247", change: "+12%",  icon: FileText,     color: "text-primary",     bg: "bg-primary/10" },
  { label: "High Risk",       value: "12",  change: "↑ 3",   icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-500/10" },
  { label: "Expiring Soon",   value: "8",   change: "7 days", icon: Clock,         color: "text-amber-500",  bg: "bg-amber-500/10" },
  { label: "AI Analyzed",     value: "195", change: "79%",    icon: CheckCircle2,  color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Good evening, Ritz 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening with your contracts today.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="kpi-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {card.change}
                </span>
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid xl:grid-cols-3 gap-4">
          {/* Area chart */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="xl:col-span-2 bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Upload Activity</h2>
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={uploadData}>
                <defs>
                  <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: 12 }} />
                <Area type="monotone" dataKey="uploads" stroke="#6366f1" strokeWidth={2} fill="url(#ug)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Donut */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <h2 className="font-semibold mb-4">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {riskData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {riskData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid xl:grid-cols-2 gap-4">
          {/* Recent docs */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent Documents</h2>
              <a href="/documents" className="text-sm text-primary hover:underline">View all</a>
            </div>
            <div className="space-y-3">
              {recentDocs.map((doc, i) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="doc-card cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.time}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RiskBadge level={doc.risk} />
                    {doc.status === "processing" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Deadlines */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Upcoming Deadlines</h2>
              <a href="/analytics" className="text-sm text-primary hover:underline">Calendar</a>
            </div>
            <div className="space-y-3">
              {deadlines.map((d, i) => (
                <motion.div
                  key={d.doc}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    d.level === "high" ? "bg-red-500/10" : d.level === "medium" ? "bg-amber-500/10" : "bg-emerald-500/10"
                  }`}>
                    <Clock className={`h-4 w-4 ${
                      d.level === "high" ? "text-red-500" : d.level === "medium" ? "text-amber-500" : "text-emerald-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.doc}</p>
                    <p className="text-xs text-muted-foreground">{d.days} days remaining</p>
                  </div>
                  <RiskBadge level={d.level} />
                </motion.div>
              ))}
            </div>

            {/* Quick upload CTA */}
            <div className="mt-4 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-center">
              <p className="text-xs text-muted-foreground mb-2">Quickly add a new contract</p>
              <a href="/documents/upload" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                <Upload className="h-3.5 w-3.5" /> Upload Document
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
