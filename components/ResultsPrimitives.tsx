import { EstimateSource } from "@/lib/types";

const sourceBadgeStyle: Record<EstimateSource, string> = {
  calculated: "text-scan-green bg-[rgba(34,197,94,.15)]",
  estimated: "text-scan-teal bg-scan-tealDim",
  directional: "text-scan-muted bg-scan-surface2",
};

const sourceBadgeLabel: Record<EstimateSource, string> = {
  calculated: "Calculated",
  estimated: "Estimated",
  directional: "Directional",
};

export function SourceBadge({ source }: { source: EstimateSource }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sourceBadgeStyle[source]}`}>{sourceBadgeLabel[source]}</span>;
}

export function MetricCard({
  label,
  value,
  subValue,
  source,
}: {
  label: string;
  value: string;
  subValue?: string;
  source?: EstimateSource;
}) {
  return (
    <div className="card-light">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-scan-muted">{label}</p>
        {source && <SourceBadge source={source} />}
      </div>
      <p className="mt-1 text-[28px] font-extrabold text-scan-text">{value}</p>
      {subValue && <p className="mt-0.5 text-xs text-scan-muted">{subValue}</p>}
    </div>
  );
}

export function MetricGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-scan-muted">{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export const impactColor: Record<string, string> = {
  High: "text-[#8affb3] bg-[rgba(34,197,94,.15)]",
  Medium: "text-[#ffd48a] bg-[rgba(245,158,11,.16)]",
  Low: "text-[#ff9a9a] bg-[rgba(239,68,68,.15)]",
};

export const ownerLegendItems: { swatch: string; label: string }[] = [
  { swatch: "bg-[#378ADD]", label: "Human" },
  { swatch: "bg-scan-teal", label: "AI" },
  { swatch: "bg-scan-accent", label: "Human + AI" },
  { swatch: "bg-scan-border", label: "System / tool" },
];

export function StepHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mb-6">
      <span className="pill">{eyebrow}</span>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight text-scan-text sm:text-[34px]">{title}</h1>
      {lead && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#cbd7f5]">{lead}</p>}
    </div>
  );
}
