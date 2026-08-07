"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { User, Bell, Shield, Palette, Key, CreditCard, Users, ChevronRight, Check, Moon, Sun, Monitor } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const TABS = [
  { id: "profile",   label: "Profile",       icon: User },
  { id: "security",  label: "Security",      icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance",   icon: Palette },
  { id: "api",       label: "API Keys",      icon: Key },
  { id: "team",      label: "Team",          icon: Users },
];

type Theme = "dark" | "light" | "system";

function ProfileTab() {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-black">
          {user?.full_name?.[0]?.toUpperCase() ?? "R"}
        </div>
        <div>
          <h3 className="font-semibold">{user?.full_name ?? "User"}</h3>
          <p className="text-sm text-muted-foreground">{user?.email ?? "user@lexai.com"}</p>
          <button className="text-xs text-primary hover:underline mt-1">Change avatar</button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: "Full Name",     value: user?.full_name ?? "",       key: "full_name" },
          { label: "Email",         value: user?.email ?? "",           key: "email" },
          { label: "Role",          value: user?.role ?? "client",      key: "role" },
          { label: "Organization",  value: "Acme Corporation",          key: "org" },
        ].map((f) => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-sm font-medium">{f.label}</label>
            <input defaultValue={f.value}
              className="w-full px-3 py-2.5 bg-secondary/50 border border-input rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
          </div>
        ))}
      </div>
      <button onClick={save} className="btn-primary flex items-center gap-2">
        {saved ? <><Check className="h-4 w-4" /> Saved!</> : "Save Changes"}
      </button>
    </div>
  );
}

function SecurityTab() {
  const [show, setShow] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold">Change Password</h3>
        {["Current Password", "New Password", "Confirm New Password"].map((l) => (
          <div key={l} className="space-y-1.5">
            <label className="text-sm font-medium">{l}</label>
            <input type={show ? "text" : "password"} placeholder="••••••••"
              className="w-full px-3 py-2.5 bg-secondary/50 border border-input rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
        ))}
        <button onClick={() => { setPwSaved(true); setTimeout(() => setPwSaved(false), 2000); }}
          className="btn-primary flex items-center gap-2">
          {pwSaved ? <><Check className="h-4 w-4" /> Updated!</> : "Update Password"}
        </button>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Authenticator App</p>
            <p className="text-xs text-muted-foreground">Use Google Authenticator or Authy</p>
          </div>
          <button className="px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-colors">
            Enable 2FA
          </button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-3">Active Sessions</h3>
        {[
          { device: "MacBook Pro — Chrome", location: "San Francisco, CA", current: true },
          { device: "iPhone 15 — Safari",   location: "San Francisco, CA", current: false },
        ].map((s) => (
          <div key={s.device} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium">{s.device}</p>
              <p className="text-xs text-muted-foreground">{s.location}</p>
            </div>
            {s.current
              ? <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full">Current</span>
              : <button className="text-xs text-red-500 hover:underline">Revoke</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceTab() {
  const [theme, setTheme] = useState<Theme>("dark");
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {([
            { id: "dark",   label: "Dark",   icon: Moon },
            { id: "light",  label: "Light",  icon: Sun },
            { id: "system", label: "System", icon: Monitor },
          ] as { id: Theme; label: string; icon: typeof Moon }[]).map((t) => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all
                ${theme === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"}`}>
              <t.icon className={`h-5 w-5 ${theme === t.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">{t.label}</span>
              {theme === t.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold">Preferences</h3>
        {[
          { label: "Compact sidebar",         sub: "Reduce sidebar padding" },
          { label: "Show document previews",  sub: "Thumbnail previews in document list" },
          { label: "Animations",              sub: "Reduce motion if preferred" },
        ].map((p, i) => (
          <div key={p.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.sub}</p>
            </div>
            <button className={`w-11 h-6 rounded-full transition-colors relative ${i === 0 ? "bg-primary" : "bg-secondary"}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${i === 0 ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiTab() {
  const [showKey, setShowKey] = useState(false);
  const fakeKey = "sk-lexai-prod-x7k2n9m4p1q8r3s5t6v0w2y4z8";
  return (
    <div className="space-y-4">
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-600">
        ⚠️ Never share your API key publicly. Rotate it immediately if compromised.
      </div>
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold">API Key</h3>
        <div className="flex gap-2">
          <input value={showKey ? fakeKey : "sk-lexai-prod-••••••••••••••••••••••"}
            readOnly className="flex-1 px-3 py-2.5 bg-secondary/50 border border-input rounded-xl text-sm font-mono" />
          <button onClick={() => setShowKey(!showKey)} className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors">
            {showKey ? "Hide" : "Show"}
          </button>
          <button onClick={() => navigator.clipboard.writeText(fakeKey)} className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors">
            Copy
          </button>
        </div>
        <div className="flex gap-2">
          <button className="text-sm text-red-500 hover:underline">Revoke Key</button>
          <button className="text-sm text-primary hover:underline ml-auto">Generate New Key</button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-2">API Usage</h3>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">This month</span>
          <span className="font-semibold">1,247 / 10,000 requests</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "12.47%" }} />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabContent: Record<string, React.ReactNode> = {
    profile: <ProfileTab />,
    security: <SecurityTab />,
    appearance: <AppearanceTab />,
    api: <ApiTab />,
    notifications: (
      <div className="space-y-3">
        {[
          { label: "Email on high-risk contract", sub: "Get email alerts for HIGH/CRITICAL risk scores" },
          { label: "Email on contract expiry",    sub: "7-day and 30-day expiry reminders" },
          { label: "In-app notifications",        sub: "Sidebar badge and notification center" },
          { label: "Weekly digest",               sub: "Summary of all contract activity" },
        ].map((p, i) => (
          <div key={p.label} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
            <div>
              <p className="text-sm font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.sub}</p>
            </div>
            <button className={`w-11 h-6 rounded-full transition-colors relative ${i !== 2 ? "bg-primary" : "bg-secondary"}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${i !== 2 ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    ),
    team: (
      <div className="space-y-3">
        {[
          { name: "Ritz",      email: "ritz@acme.com",    role: "Admin",    avatar: "R" },
          { name: "Teammate",  email: "dev@acme.com",      role: "Developer", avatar: "T" },
        ].map((m) => (
          <div key={m.email} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0">
              {m.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.email}</p>
            </div>
            <span className="text-xs bg-secondary px-3 py-1 rounded-full">{m.role}</span>
          </div>
        ))}
        <button className="btn-primary flex items-center gap-2 py-2">
          <Users className="h-4 w-4" /> Invite Team Member
        </button>
      </div>
    ),
  };

  return (
    <AppShell title="Settings">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-6">
          {/* Settings sidebar */}
          <aside className="w-52 flex-shrink-0 hidden md:block">
            <nav className="space-y-0.5">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-item w-full ${activeTab === tab.id ? "active" : ""}`}>
                  <tab.icon className="h-4 w-4 flex-shrink-0" />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
