import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "gold";
  size?: "sm" | "md";
}

export function Badge({ children, variant = "neutral", size = "sm" }: BadgeProps) {
  const styles = {
    success: "bg-forest-100 text-forest-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-teal-50 text-teal-700",
    neutral: "bg-ink-100 text-ink-600",
    gold: "bg-amber-100 text-amber-800 border border-amber-200",
  };
  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span className={`badge ${styles[variant]} ${sizeClass}`}>
      {children}
    </span>
  );
}

interface EmptyProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function Empty({ title, description, icon, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center text-forest-400 mb-4">
          {icon}
        </div>
      )}
      <h4 className="display text-base font-semibold text-ink-700">{title}</h4>
      {description && <p className="text-sm text-ink-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface StatPillProps {
  value: number;
  suffix?: string;
  invert?: boolean;
}

export function StatPill({ value, suffix = "%", invert = false }: StatPillProps) {
  const positive = value >= 0;
  const isGood = invert ? !positive : positive;
  const color = isGood ? "text-forest-600 bg-forest-50" : "text-signal-rose bg-rose-50";
  const arrow = positive ? "↑" : "↓";
  return (
    <span className={`badge ${color} tabular`}>
      {arrow} {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}
