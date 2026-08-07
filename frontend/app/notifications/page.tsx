"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Bell, AlertTriangle, CheckCircle2, Clock, FileText, Zap, X, Check } from "lucide-react";

type NotifType = "risk" | "expiry" | "upload" | "analysis" | "system";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK: Notif[] = [
  { id: "1", type: "risk",     title: "HIGH RISK Contract Detected",         body: "ServiceAgreement_Acme.pdf scored 78/100 — unlimited liability clause found.",    time: "2h ago",  read: false },
  { id: "2", type: "expiry",   title: "Contract Expiring in 7 Days",          body: "NDA_TechPartner_v2.docx expires on Aug 14, 2026. Action required.",               time: "5h ago",  read: false },
  { id: "3", type: "analysis", title: "AI Analysis Complete",                  body: "EmployeeAgreement_2026.pdf has been fully analyzed. Risk: LOW (18/100).",         time: "1d ago",  read: false },
  { id: "4", type: "upload",   title: "New Document Uploaded",                 body: "RentalContract_Office.pdf uploaded and queued for AI processing.",                time: "1d ago",  read: true  },
  { id: "5", type: "expiry",   title: "Contract Expiring in 14 Days",          body: "ServiceAgreement_renewal.pdf expires Aug 21, 2026.",                              time: "2d ago",  read: true  },
  { id: "6", type: "system",   title: "New Feature: Contract Comparison",      body: "You can now compare two contracts side-by-side with AI diff analysis.",           time: "3d ago",  read: true  },
];

const typeConfig: Record<NotifType, { icon: typeof Bell; color: string; bg: string }> = {
  risk:     { icon: AlertTriangle, color: "text-red-500",     bg: "bg-red-500/10" },
  expiry:   { icon: Clock,         color: "text-amber-500",   bg: "bg-amber-500/10" },
  analysis: { icon: Zap,           color: "text-primary",     bg: "bg-primary/10" },
  upload:   { icon: FileText,      color: "text-emerald-500", bg: "bg-emerald-500/10" },
  system:   { icon: Bell,          color: "text-purple-500",  bg: "bg-purple-500/10" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>(MOCK);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const markAll = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications((p) => p.filter((n) => n.id !== id));

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <AppShell title="Notifications">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {(["all", "unread"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all
                    ${filter === f ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {f} {f === "unread" && unreadCount > 0 && `(${unreadCount})`}
                </button>
              ))}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAll} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <CheckCircle2 className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <AnimatePresence>
          {visible.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No notifications</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {visible.map((n) => {
                const Cfg = typeConfig[n.type];
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className={`bg-card border rounded-2xl p-4 transition-all group
                      ${n.read ? "border-border" : "border-primary/30 bg-primary/[0.02]"}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${Cfg.bg}`}>
                        <Cfg.icon className={`h-5 w-5 ${Cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold ${n.read ? "text-foreground" : "text-foreground"}`}>
                            {!n.read && <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 align-middle" />}
                            {n.title}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {!n.read && (
                              <button onClick={() => markRead(n.id)} title="Mark read"
                                className="p-1 rounded-lg hover:bg-secondary transition-colors">
                                <Check className="h-3.5 w-3.5 text-primary" />
                              </button>
                            )}
                            <button onClick={() => dismiss(n.id)} title="Dismiss"
                              className="p-1 rounded-lg hover:bg-secondary transition-colors">
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">{n.time}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
