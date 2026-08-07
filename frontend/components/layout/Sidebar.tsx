"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, LayoutDashboard, FileText, Bot, Search,
  BarChart3, Bell, Users, Settings, ChevronDown,
  LogOut, Sparkles, X, Menu
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Bot, label: "AI Analysis", href: "/ai/analyze" },
  { icon: Sparkles, label: "Generator", href: "/ai/generate" },
  { icon: Search, label: "Legal Research", href: "/legal-research" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Bell, label: "Notifications", href: "/notifications", badge: 3 },
  { icon: Users, label: "Team", href: "/team" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  lawyer: "Lawyer",
  hr_manager: "HR Manager",
  business_user: "Business User",
  client: "Client",
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">LexAI</span>
          </Link>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-secondary" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-item group ${isActive ? "active" : ""}`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="text-xs bg-primary text-white rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1.5">
                    {item.badge}
                  </span>
                ) : null}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="p-3 border-t border-border/50">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="sidebar-item w-full relative"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user?.full_name ?? "User"}</p>
              <p className="text-xs text-muted-foreground">{roleLabels[user?.role ?? "client"]}</p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1 bg-secondary rounded-xl overflow-hidden border border-border"
              >
                <Link href="/settings" className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-border transition-colors">
                  <Settings className="h-3.5 w-3.5" /> Settings
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && <h1 className="text-lg font-semibold hidden md:block">{title}</h1>}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="global-search"
            type="search"
            placeholder="Search contracts…"
            className="pl-9 pr-4 py-2 bg-secondary/60 border border-input rounded-xl text-sm w-64
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/documents/upload"
          id="topbar-upload"
          className="btn-primary text-sm flex items-center gap-2 py-2 px-4"
        >
          <FileText className="h-4 w-4" /> Upload
        </Link>
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl hover:bg-secondary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </Link>
      </div>
    </header>
  );
}
