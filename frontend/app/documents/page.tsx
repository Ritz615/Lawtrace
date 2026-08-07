"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { RiskBadge } from "@/components/ui/RiskBadge";
import {
  FileText, Upload, Search, Filter, Grid3x3, List,
  Folder, Tag, Download, Eye, Zap, MoreHorizontal,
  CloudUpload, X, CheckCircle2, Loader2
} from "lucide-react";
import type { RiskLevel } from "@/types";

// ── Mock data ─────────────────────────────────────────────────────────────────
const folders = [
  { name: "All Documents", count: 247 },
  { name: "Active", count: 189 },
  { name: "HR", count: 43 },
  { name: "Legal", count: 78 },
  { name: "Finance", count: 31 },
  { name: "Archive", count: 58 },
];

const tags = ["#legal", "#hr", "#vendor", "#nda", "#employment", "#finance"];

const documents = [
  { id: "1", name: "ServiceAgreement_Acme.pdf",      type: "pdf",  size: "2.4 MB", date: "Aug 5, 2026", risk: "high"   as RiskLevel, status: "analyzed",   tags: ["#legal", "#vendor"], version: 2 },
  { id: "2", name: "NDA_TechPartner_v2.docx",         type: "docx", size: "380 KB", date: "Aug 3, 2026", risk: "medium" as RiskLevel, status: "analyzed",   tags: ["#nda"],              version: 2 },
  { id: "3", name: "EmployeeAgreement_2026.pdf",      type: "pdf",  size: "1.1 MB", date: "Aug 1, 2026", risk: "low"    as RiskLevel, status: "analyzed",   tags: ["#hr", "#employment"], version: 1 },
  { id: "4", name: "RentalContract_Office.pdf",       type: "pdf",  size: "890 KB", date: "Jul 28, 2026", risk: "medium" as RiskLevel, status: "processing", tags: ["#legal"],            version: 1 },
  { id: "5", name: "PartnershipAgreement_2026.docx",  type: "docx", size: "540 KB", date: "Jul 25, 2026", risk: "low"    as RiskLevel, status: "analyzed",   tags: ["#legal"],            version: 3 },
  { id: "6", name: "FreelanceContract_Design.pdf",    type: "pdf",  size: "212 KB", date: "Jul 20, 2026", risk: "critical" as RiskLevel, status: "analyzed", tags: ["#vendor"],           version: 1 },
];

const typeIcon: Record<string, string> = { pdf: "📄", docx: "📝", image: "🖼️" };

// ── Dropzone ──────────────────────────────────────────────────────────────────
function UploadDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; status: "uploading" | "done" }[]>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    onFiles(files);
    const items = files.map((f) => ({ name: f.name, status: "uploading" as const }));
    setUploadedFiles(items);
    // Simulate upload
    setTimeout(() => setUploadedFiles(files.map((f) => ({ name: f.name, status: "done" }))), 2000);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = ".pdf,.docx,.doc,.png,.jpg,.jpeg";
          input.onchange = (e) => handleFiles(Array.from((e.target as HTMLInputElement).files ?? []));
          input.click();
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${isDragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
      >
        <CloudUpload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        <p className="font-medium text-sm">
          {isDragging ? "Drop files to upload" : "Drop files here or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PNG, JPG — up to 50 MB</p>
      </div>

      <AnimatePresence>
        {uploadedFiles.map((f) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-3 p-3 bg-secondary rounded-xl text-sm"
          >
            {f.status === "uploading"
              ? <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
              : <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
            <span className="flex-1 truncate">{f.name}</span>
            <span className="text-xs text-muted-foreground">{f.status === "uploading" ? "Uploading…" : "Done"}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [selectedFolder, setSelectedFolder] = useState("All Documents");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const filtered = documents.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedTag && !d.tags.includes(selectedTag)) return false;
    return true;
  });

  return (
    <AppShell title="Documents">
      <div className="flex gap-6 h-full max-w-7xl mx-auto">
        {/* Folder sidebar */}
        <aside className="w-52 flex-shrink-0 hidden lg:block space-y-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Folders</p>
            <div className="space-y-0.5">
              {folders.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFolder(f.name)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all
                    ${selectedFolder === f.name ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  <Folder className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1 text-left">{f.name}</span>
                  <span className="text-xs opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  className={`text-xs px-2 py-1 rounded-lg border transition-all
                    ${selectedTag === t ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-transparent hover:border-primary/20"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="doc-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents…"
                  className="w-full pl-9 pr-4 py-2 bg-secondary/60 border border-input rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-input text-sm hover:bg-secondary transition-colors">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-border overflow-hidden">
                {(["list", "grid"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`p-2 transition-colors ${view === v ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"}`}
                    aria-label={`${v} view`}
                  >
                    {v === "list" ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
                  </button>
                ))}
              </div>
              <button
                id="upload-docs-btn"
                onClick={() => setShowUpload(!showUpload)}
                className="btn-primary flex items-center gap-2 py-2"
              >
                <Upload className="h-4 w-4" /> Upload
              </button>
            </div>
          </div>

          {/* Upload zone */}
          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <UploadDropzone onFiles={() => {}} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats bar */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filtered.length} documents</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Tag className="h-3 w-3" /> {selectedTag} <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Documents */}
          <div className={view === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-2"}>
            {filtered.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group
                  ${view === "list" ? "flex items-center gap-4" : "flex flex-col gap-3"}`}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors text-lg">
                  {typeIcon[doc.type] ?? "📄"}
                </div>

                {/* Info */}
                <div className={`flex-1 min-w-0 ${view === "grid" ? "" : ""}`}>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{doc.date}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{doc.size}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">v{doc.version}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {doc.tags.map((t) => (
                      <span key={t} className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 ${view === "list" ? "flex-shrink-0" : "justify-between"}`}>
                  <RiskBadge level={doc.risk} />
                  {doc.status === "processing" && (
                    <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-secondary" aria-label="View"><Eye className="h-3.5 w-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-secondary" aria-label="Analyze"><Zap className="h-3.5 w-3.5 text-primary" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-secondary" aria-label="Download"><Download className="h-3.5 w-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-secondary" aria-label="More"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
