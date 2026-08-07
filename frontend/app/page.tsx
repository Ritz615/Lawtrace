"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Scale, ArrowRight, Shield, Zap, FileText, BarChart3 } from "lucide-react";

const features = [
  { icon: FileText, title: "Smart Contract Analysis", desc: "AI extracts 14+ clause types, detects risks, and explains legal language in plain English." },
  { icon: Shield, title: "Risk Intelligence", desc: "Instant risk scoring (Low/Medium/High/Critical) with business impact explanations." },
  { icon: Zap, title: "AI Legal Assistant", desc: "Chat with your contracts. Ask any question, get answers backed by document context." },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Professional PDF/DOCX reports, deadline tracking, and department-level analytics." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-mesh">
      {/* Navbar */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold gradient-text">LexAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full border border-primary/20 mb-8">
            <Zap className="h-3.5 w-3.5" />
            Powered by LangGraph Multi-Agent AI
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            The AI-Native{" "}
            <span className="gradient-text">Legal Operating</span>
            <br />System for Enterprises
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Upload, analyze, generate, and manage your contracts with cutting-edge AI. 
            Detect risks instantly, chat with your documents, and never miss a deadline.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2 text-base py-3 px-8">
              Start for Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-base py-3 px-8 rounded-xl border border-border hover:bg-secondary transition-colors"
            >
              View Demo
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "14+", label: "Clause Types Extracted" },
            { value: "94%", label: "AI Accuracy" },
            { value: "<3s", label: "Analysis Time" },
            { value: "9", label: "Contract Templates" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="kpi-card gradient-border"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <span className="font-semibold">LexAI</span>
          </div>
          <span>© 2026 LexAI. Enterprise AI Contract Management.</span>
        </div>
      </footer>
    </div>
  );
}
