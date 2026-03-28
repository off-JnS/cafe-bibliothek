import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  icon: ReactNode;
  label: string;
  value: number | string;
  accent?: string;
  to?: string;
}

export default function StatCard({ icon, label, value, accent, to }: Props) {
  const card = (
    <div className={`flex items-center gap-3 rounded-2xl bg-cream p-4 shadow-sm transition-all ${to ? "active:scale-[0.97]" : ""}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-light/50 ${accent ?? "text-sage-dark"}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wider text-warm-gray">{label}</p>
        <p className={`text-xl font-bold leading-tight ${accent ?? "text-charcoal"}`}>{value}</p>
      </div>
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
}
