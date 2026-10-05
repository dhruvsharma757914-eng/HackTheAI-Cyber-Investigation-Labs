import type { Severity } from "@/lib/content/types";

export const severityStyles: Record<
  Severity,
  { text: string; border: string; bg: string; label: string }
> = {
  low: {
    text: "text-signal-cyan",
    border: "border-signal-cyan/40",
    bg: "bg-signal-cyan/10",
    label: "LOW",
  },
  medium: {
    text: "text-signal-amber",
    border: "border-signal-amber/40",
    bg: "bg-signal-amber/10",
    label: "MEDIUM",
  },
  high: {
    text: "text-signal-violet",
    border: "border-signal-violet/40",
    bg: "bg-signal-violet/10",
    label: "HIGH",
  },
  critical: {
    text: "text-signal-red",
    border: "border-signal-red/40",
    bg: "bg-signal-red/10",
    label: "CRITICAL",
  },
};

export function SeverityChip({ severity }: { severity: Severity }) {
  const style = severityStyles[severity];
  return (
    <span className={`chip ${style.border} ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export function Panel({
  title,
  right,
  children,
  className = "",
  bodyClassName = "p-4",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-head">
          <h2 className="panel-title">{title}</h2>
          {right}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function ProgressBar({
  value,
  max,
  tone = "green",
}: {
  value: number;
  max: number;
  tone?: "green" | "cyan" | "violet";
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const fill =
    tone === "cyan"
      ? "bg-signal-cyan"
      : tone === "violet"
        ? "bg-signal-violet"
        : "bg-signal-green";

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-void-700">
      <div
        className={`h-full rounded-full ${fill} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function MetaRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-void-700 py-2 last:border-0">
      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
        {label}
      </span>
      <span className="text-right text-xs text-slate-300">{value}</span>
    </div>
  );
}

export function TerminalFrame({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`panel ${className}`}>
      <div className="panel-head">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-signal-red/70" />
          <span className="h-2 w-2 rounded-full bg-signal-amber/70" />
          <span className="h-2 w-2 rounded-full bg-signal-green/70" />
        </div>
        <span className="panel-title truncate">{title}</span>
        <span className="w-10" />
      </div>
      {children}
    </div>
  );
}
