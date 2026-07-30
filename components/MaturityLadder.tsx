"use client";

import { MaturityScores } from "@/lib/types";

function levelLabel(score: number): string {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Emerging";
  return "Low";
}

function barColor(score: number): string {
  if (score >= 70) return "bg-scan-green";
  if (score >= 40) return "bg-scan-teal";
  return "bg-scan-amber";
}

const assessedLayers: { key: keyof Pick<MaturityScores, "process" | "visibility" | "automation">; num: string; title: string; tagline: string }[] = [
  { key: "process", num: "01", title: "Process OS", tagline: "How work gets done" },
  { key: "visibility", num: "02", title: "Visibility OS", tagline: "See the business" },
  { key: "automation", num: "03", title: "Automation OS", tagline: "Reduce manual work" },
];

export default function MaturityLadder({ maturity }: { maturity: MaturityScores }) {
  const foundationSolid = maturity.currentLevel >= 4;

  return (
    <div>
      <div className="space-y-3">
        {assessedLayers.map((layer) => {
          const score = maturity[layer.key];
          return (
            <div key={layer.key} className="rounded-xl border border-scan-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-scan-muted">{layer.num}</span>
                  <span className="text-sm font-semibold text-scan-text">{layer.title}</span>
                  <span className="text-xs text-scan-muted">— {layer.tagline}</span>
                </div>
                <span className="text-xs font-semibold text-scan-muted">{levelLabel(score)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-scan-surface2">
                <div className={`h-full rounded-full ${barColor(score)}`} style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        })}

        <div className={`rounded-xl border p-3 ${foundationSolid ? "border-scan-accent" : "border-dashed border-scan-border opacity-60"}`}>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-scan-muted">04</span>
            <span className="text-sm font-semibold text-scan-text">Intelligence OS</span>
            <span className="text-xs text-scan-muted">— Improve decisions</span>
          </div>
          <p className="mt-1 text-xs text-scan-muted">
            {foundationSolid ? "Foundation is solid — AI agents can create real value here now." : "Unlocks once Process/Visibility/Automation are solid."}
          </p>
        </div>
        <div className={`rounded-xl border p-3 ${foundationSolid ? "border-scan-accent" : "border-dashed border-scan-border opacity-60"}`}>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-scan-muted">05</span>
            <span className="text-sm font-semibold text-scan-text">Decision OS</span>
            <span className="text-xs text-scan-muted">— Focus on what matters</span>
          </div>
          <p className="mt-1 text-xs text-scan-muted">Where this is headed — strategic decisions, growth, partnerships, innovation.</p>
        </div>
      </div>

      {!foundationSolid && (
        <p className="mt-3 text-xs text-scan-muted">
          Some recommended agents below may be flagged <span className="text-scan-amber">⚠ Foundation needed</span> — they'll still
          work, just with less to work from until the layer under them is stronger.
        </p>
      )}
    </div>
  );
}
