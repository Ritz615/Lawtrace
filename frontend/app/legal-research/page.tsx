"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Search, BookOpen, Scale, ExternalLink, Filter, Loader2, Sparkles } from "lucide-react";

const CATEGORIES = ["All", "Case Law", "Statutes", "Regulations", "Contracts", "Templates"];

const mockResults = [
  { id: 1, title: "Limitation of Liability Clauses in Service Agreements", source: "California Court of Appeals", category: "Case Law", snippet: "Courts have consistently held that limitation of liability clauses must be conspicuous and explicitly negotiated to be enforceable. In cases where liability is unlimited, courts may look to industry standards...", year: 2024, relevance: 97 },
  { id: 2, title: "GDPR Article 28 — Data Processing Agreements Requirements", source: "EU Regulation 2016/679", category: "Regulations", snippet: "Where processing is to be carried out on behalf of a controller, the controller shall use only processors providing sufficient guarantees to implement appropriate technical and organizational measures...", year: 2018, relevance: 91 },
  { id: 3, title: "Standard NDA Terms — Best Practices", source: "American Bar Association", category: "Templates", snippet: "A well-drafted NDA should define confidential information broadly, specify exclusions (public domain, independently developed), set a reasonable confidentiality period (2-5 years), and specify consequences of breach...", year: 2025, relevance: 88 },
  { id: 4, title: "Intellectual Property Assignment in Employment Contracts", source: "USPTO Guidelines", category: "Statutes", snippet: "Under 35 U.S.C. §261, patent rights can be assigned to employers through employment agreements. The agreement must clearly specify the scope of assignment and whether it covers pre-existing IP...", year: 2023, relevance: 85 },
  { id: 5, title: "Force Majeure Clauses Post-COVID — Enforceability", source: "Harvard Law Review", category: "Case Law", snippet: "Recent court decisions have clarified that force majeure clauses must specifically enumerate pandemic/epidemic events to be triggered by COVID-19 related disruptions. Generic 'acts of God' provisions were largely insufficient...", year: 2023, relevance: 82 },
];

export default function LegalResearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    await new Promise((r) => setTimeout(r, 1800));
    setAiSummary(`Based on legal precedents and regulations for "${query}", courts generally require that such clauses be clearly written, mutually agreed upon, and not contrary to public policy. Key considerations include: enforceability in your jurisdiction, applicable statutory limits, and recent case law developments. Review the top results below for specific citations.`);
    setHasSearched(true);
    setIsSearching(false);
  };

  const filtered = hasSearched
    ? mockResults.filter((r) => category === "All" || r.category === category)
    : [];

  return (
    <AppShell title="Legal Research">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search hero */}
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Scale className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">AI Legal Research</h1>
          <p className="text-muted-foreground text-sm mb-6">Search case law, statutes, regulations, and contract templates using natural language</p>

          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="legal-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder='e.g. "liability cap clauses in SaaS contracts California law"'
                className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-input rounded-2xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <button
              id="legal-search-btn"
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isSearching ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Quick search chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Limitation of liability", "NDA enforceability", "IP assignment", "Force majeure", "Non-compete validity"].map((s) => (
              <button key={s} onClick={() => { setQuery(s); }} className="text-xs bg-secondary hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 px-3 py-1.5 rounded-full transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isSearching && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-medium">Searching legal databases…</p>
              <p className="text-sm text-muted-foreground">Case law • Statutes • Regulations • Templates</p>
            </div>
            <div className="flex gap-1.5">
              {[0,1,2,3,4].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* AI summary */}
            {aiSummary && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">AI Research Summary</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary}</p>
              </div>
            )}

            {/* Category filters */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${category === c ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {c}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">{filtered.length} results for "{query}"</p>

            {/* Results list */}
            <div className="space-y-3">
              {filtered.map((result, i) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{result.category}</span>
                        <span className="text-xs text-muted-foreground">{result.source} · {result.year}</span>
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors mb-2">{result.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{result.snippet}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Relevance</div>
                        <div className="text-lg font-bold text-primary">{result.relevance}%</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.relevance}%` }}
                      transition={{ delay: i * 0.07 + 0.3, duration: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
