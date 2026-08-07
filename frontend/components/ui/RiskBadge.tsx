"use client";

import type { RiskLevel } from "@/types";

const config: Record<RiskLevel, { label: string; className: string }> = {
  low:      { label: "LOW",      className: "risk-low" },
  medium:   { label: "MEDIUM",   className: "risk-medium" },
  high:     { label: "HIGH",     className: "risk-high" },
  critical: { label: "CRITICAL", className: "risk-critical" },
};

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function RiskBadge({ level, showIcon = false, size = "sm" }: RiskBadgeProps) {
  const { label, className } = config[level];
  const icons: Record<RiskLevel, string> = { low: "✓", medium: "⚡", high: "⚠", critical: "🔴" };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${className}
        ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"}`}
    >
      {showIcon && <span>{icons[level]}</span>}
      {label}
    </span>
  );
}
