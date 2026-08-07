"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { CloudUpload, FileText, X, CheckCircle2, Loader2, Tag, Folder, ArrowRight } from "lucide-react";
import { documentsApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  docId?: string;
}

const FOLDERS = ["All Documents", "HR", "Legal", "Finance", "Ops", "Sales", "Archive"];
const TAGS_OPTIONS = ["#nda", "#legal", "#hr", "#vendor", "#employment", "#finance"];

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [folder, setFolder] = useState("All Documents");
  const [tags, setTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((incoming: File[]) => {
    const newFiles: UploadFile[] = incoming.map((f) => ({
      file: f,
      id: `${f.name}-${Date.now()}`,
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.docx,.doc,.png,.jpg,.jpeg,.tiff";
    input.onchange = (e) => addFiles(Array.from((e.target as HTMLInputElement).files ?? []));
    input.click();
  };

  const uploadAll = async () => {
    if (!files.length) return;
    setIsUploading(true);

    for (const uf of files) {
      setFiles((prev) =>
        prev.map((f) => f.id === uf.id ? { ...f, status: "uploading", progress: 30 } : f)
      );
      try {
        const folderVal = folder === "All Documents" ? undefined : folder;
        const res = await documentsApi.upload(uf.file, folderVal, tags.join(",")) as { data: { id: string } };
        setFiles((prev) =>
          prev.map((f) => f.id === uf.id ? { ...f, status: "done", progress: 100, docId: res.data.id } : f)
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setFiles((prev) =>
          prev.map((f) => f.id === uf.id ? { ...f, status: "error", error: msg } : f)
        );
      }
    }
    setIsUploading(false);
  };

  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AppShell title="Upload Documents">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handleBrowse}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all
            ${isDragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-primary/5"}`}
        >
          <motion.div animate={{ y: isDragging ? -8 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
            <CloudUpload className={`h-14 w-14 mx-auto mb-4 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          </motion.div>
          <p className="text-lg font-semibold mb-1">
            {isDragging ? "Drop files to upload" : "Drop files here or click to browse"}
          </p>
          <p className="text-sm text-muted-foreground">PDF, DOCX, DOC, PNG, JPG, TIFF — up to 50 MB each</p>
        </div>

        {/* Options */}
        {files.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Folder className="h-4 w-4 text-primary" /> Destination Folder
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-input rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TAGS_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTags((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all
                      ${tags.includes(t) ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary border-transparent text-muted-foreground hover:border-primary/20"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* File list */}
        <AnimatePresence>
          {files.map((uf) => (
            <motion.div
              key={uf.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uf.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(uf.file.size)}</p>
                {uf.status === "uploading" && (
                  <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uf.progress}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                )}
                {uf.status === "error" && (
                  <p className="text-xs text-destructive mt-1">{uf.error}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                {uf.status === "pending"   && <button onClick={() => removeFile(uf.id)}><X className="h-4 w-4 text-muted-foreground hover:text-destructive" /></button>}
                {uf.status === "uploading" && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                {uf.status === "done"      && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {uf.status === "error"     && <X className="h-5 w-5 text-destructive" />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Actions */}
        {files.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
            <div className="flex gap-3">
              {allDone ? (
                <button onClick={() => router.push("/documents")}
                  className="btn-primary flex items-center gap-2">
                  Go to Documents <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button onClick={() => setFiles([])} className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors">
                    Clear All
                  </button>
                  <button
                    id="upload-submit"
                    onClick={uploadAll}
                    disabled={isUploading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                  >
                    {isUploading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                      : <><CloudUpload className="h-4 w-4" /> Upload {files.length} File{files.length > 1 ? "s" : ""}</>}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
