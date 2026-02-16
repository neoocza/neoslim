import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-card-bg border border-card-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className={accent ? "text-accent" : "text-muted"}>{icon}</span>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </div>
  );
}
