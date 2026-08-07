"use client";

import { motion } from "framer-motion";
import {
  FileText, AlertTriangle, Clock, CheckCircle2,
  TrendingUp, Upload, Bell, Scale, BarChart3,
  Users, Settings, Search, Menu, ChevronDown
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ── Mock data (replace with API calls in Phase 2) ────────────────────────────
const uploadData = [
  { month: "Mar", uploads: 18 }, { month: "Apr", uploads: 24 },
  { month: "May", uploads: 31 }, { month: "Jun", uploads: 28 },
  { month: "Jul", uploads: 42 }, { month: "Aug", uploads: 35 },
];

const riskData = [
  { name: "Low", value: 45, color: "#10b981" },
  { name: "Medium", value: 30, color: "#f59e0b" },
  { name: "High", value: 18, color: "#ef4444" },
  { name: "Critical", value: 7, color: "#dc2626" },
];

const recentDocs = [
  { name: "ServiceAgreement_Acme.pdf", risk: "HIGH", time: "2h ago", status: "analyzed" },
  { name: "NDA_TechPartner_v2.docx", risk: "MEDIUM", time: "5h ago", status: "analyzed" },
  { name: "EmployeeAgreement_2026.pdf", risk: "LOW", time: "1d ago", status: "analyzed" },
  { name: "RentalContract_Office.pdf", risk: "MEDIUM", time: "2d ago", status: "processing" },
];

const kpiCards = [
  { label: "Total Contracts", value: "247", change: "+12%", icon: FileText, color: "text-primary" },
  { label: "High Risk", value: "12", change: "↑ 3", icon: AlertTriangle, color: "text-red-500" },
  { label: "Expiring Soon", value: "8", change: "7 days", icon: Clock, color: "text-amber-500" },
  { label: "AI Analyzed", value: "195", change: "79%", icon: CheckCircle2, color: "text-emerald-500" },
];

const riskColor: Record<string, string> = {
  HIGH: "risk-high",
  MEDIUM: "risk-medium",
  LOW: "risk-low",
  CRITICAL: "risk-critical",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col p-4 hidden md:flex">
        <div className="flex items-center gap-2 px-3 py-2 mb-6">
          <Scale className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold gradient-text">LexAI</span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { icon: BarChart3, label: "Dashboard", href: "/dashboard", active: true },
            { icon: FileText, label: "Documents", href: "/documents" },
            { icon: Scale, label: "AI Analysis", href: "/ai/analyze" },
            { icon: Search, label: "Legal Research", href: "/legal-research" },
            { icon: BarChart3, label: "Analytics", href: "/analytics" },
            { icon: Bell, label: "Notifications", href: "/notifications", badge: 3 },
            { icon: Users, label: "Team", href: "/team" },
            { icon: Settings, label: "Settings", href: "/settings" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`sidebar-item ${item.active ? "active" : ""}`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs bg-primary text-white rounded-full px-1.5 py-0.5">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-border pt-4 mt-4">
          <button className="sidebar-item w-full">
            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
              R
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-medium text-foreground">Ritz</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="global-search"
                type="search"
                placeholder="Search contracts..."
                className="pl-9 pr-4 py-2 bg-secondary/50 border border-input rounded-xl text-sm w-64
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="upload-btn"
              className="btn-primary text-sm flex items-center gap-2 py-2"
              onClick={() => window.location.href = "/documents/upload"}
            >
              <Upload className="h-4 w-4" /> Upload
            </button>
            <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full pulse-red" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-2xl font-bold">Good evening, Ritz 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Here&apos;s what&apos;s happening with your contracts today.
            </p>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="kpi-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-current/10`} style={{ backgroundColor: "hsla(239,84%,67%,0.08)" }}>
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

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Upload trend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Upload Activity</h2>
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={uploadData}>
                  <defs>
                    <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(239,84%,67%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area type="monotone" dataKey="uploads" stroke="hsl(239,84%,67%)" strokeWidth={2} fill="url(#uploadGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Risk Distribution */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h2 className="font-semibold mb-4">Risk Distribution</h2>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {riskData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {riskData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium">{d.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Documents */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
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
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="doc-card"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${riskColor[doc.risk]}`}>
                      {doc.risk}
                    </span>
                    {doc.status === "processing" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 pulse-red" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
