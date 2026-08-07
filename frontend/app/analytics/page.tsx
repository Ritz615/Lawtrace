"use client";

import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

const riskByDept = [
  { dept: "Legal",   low: 23, medium: 8, high: 5, critical: 1 },
  { dept: "HR",      low: 18, medium: 12, high: 3, critical: 0 },
  { dept: "Finance", low: 11, medium: 6, high: 8, critical: 2 },
  { dept: "Ops",     low: 9,  medium: 4, high: 2, critical: 0 },
  { dept: "Sales",   low: 15, medium: 9, high: 4, critical: 1 },
];

const monthlyTrend = [
  { month: "Mar", analyzed: 18, generated: 4, expired: 2 },
  { month: "Apr", analyzed: 24, generated: 7, expired: 3 },
  { month: "May", analyzed: 31, generated: 5, expired: 1 },
  { month: "Jun", analyzed: 28, generated: 9, expired: 4 },
  { month: "Jul", analyzed: 42, generated: 11, expired: 2 },
  { month: "Aug", analyzed: 35, generated: 8, expired: 3 },
];

const typeBreakdown = [
  { name: "NDA",         value: 62, color: "#6366f1" },
  { name: "Service",     value: 48, color: "#8b5cf6" },
  { name: "Employment",  value: 43, color: "#10b981" },
  { name: "Rental",      value: 31, color: "#f59e0b" },
  { name: "Freelance",   value: 28, color: "#ef4444" },
  { name: "Other",       value: 35, color: "#64748b" },
];

const expiringContracts = [
  { name: "NDA_Acme_Corp.pdf",         days: 7,  dept: "Legal",   value: "$50K" },
  { name: "ServiceAgreement_Tech.pdf", days: 14, dept: "Ops",     value: "$120K" },
  { name: "Freelance_Design.pdf",      days: 18, dept: "Sales",   value: "$12K" },
  { name: "Employment_Adams.pdf",      days: 21, dept: "HR",      value: "N/A" },
  { name: "Partnership_XYZ.pdf",       days: 30, dept: "Finance", value: "$300K" },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: 12 },
  labelStyle: { color: "hsl(var(--foreground))" },
};

const kpis = [
  { label: "Total Contracts",    value: "247", sub: "Across all departments" },
  { label: "Avg. Risk Score",    value: "42",  sub: "Out of 100" },
  { label: "Contracts Expiring", value: "8",   sub: "In next 30 days" },
  { label: "AI Accuracy",        value: "94%", sub: "Clause extraction" },
];

export default function AnalyticsPage() {
  return (
    <AppShell title="Analytics">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="kpi-card text-center"
            >
              <div className="text-4xl font-black gradient-text mb-1">{k.value}</div>
              <div className="text-sm font-semibold">{k.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{k.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Monthly trend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Monthly Activity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="analyzed"  stroke="#6366f1" strokeWidth={2} dot={false} name="Analyzed" />
              <Line type="monotone" dataKey="generated" stroke="#10b981" strokeWidth={2} dot={false} name="Generated" />
              <Line type="monotone" dataKey="expired"   stroke="#ef4444" strokeWidth={2} dot={false} name="Expired" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Risk by dept */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Risk by Department</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={riskByDept} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dept" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="low"      fill="#10b981" name="Low"      radius={[2,2,0,0]} />
                <Bar dataKey="medium"   fill="#f59e0b" name="Medium"   radius={[2,2,0,0]} />
                <Bar dataKey="high"     fill="#ef4444" name="High"     radius={[2,2,0,0]} />
                <Bar dataKey="critical" fill="#dc2626" name="Critical" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Type breakdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.43 }}
            className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Contract Type Breakdown</h2>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {typeBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {typeBreakdown.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Expiring contracts */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold mb-4">⏰ Expiring Soon</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Contract</th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Department</th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Contract Value</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Days Remaining</th>
                </tr>
              </thead>
              <tbody>
                {expiringContracts.map((c, i) => (
                  <motion.tr
                    key={c.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.dept}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.value}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${c.days <= 7 ? "bg-red-500/10 text-red-600" : c.days <= 14 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                        {c.days} days
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
