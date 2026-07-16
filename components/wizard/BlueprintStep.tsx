"use client";

import { BusinessProfile, GeneratedResults } from "@/lib/types";
import { StepHeading } from "../ResultsPrimitives";

export default function BlueprintStep({ profile, results }: { profile: BusinessProfile; results: GeneratedResults }) {
  const deploymentOrder = [...results.opportunities].sort((a, b) => b.priorityStars - a.priorityStars);
  const industryLabel = profile.company.industry || "this business";

  const verdict =
    results.readinessScore >= 75
      ? "high customer-facing AI potential"
      : results.readinessScore >= 55
      ? "solid, well-defined AI opportunity"
      : "early-stage opportunity — foundational fixes come first";

  return (
    <div>
      <StepHeading
        eyebrow="Step 8"
        title="Executive AI transformation blueprint"
        lead="Boardroom-ready output that becomes both the sales proposal and the implementation starting point."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-lg font-bold text-scan-text">Executive summary</h2>
          <p className="mb-4 text-sm text-scan-muted">
            {industryLabel} shows {verdict}. The highest-ROI starting points are{" "}
            {deploymentOrder.slice(0, 2).map((o) => o.opportunity).join(" and ") || "not yet defined — add pain points in Business Profile"}.
          </p>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-scan-surface2">
            <div className="h-full bg-scan-teal" style={{ width: `${results.readinessScore}%` }} />
          </div>
          <p className="text-xs text-scan-muted">
            AI Readiness: <span className="font-mono text-scan-teal">{results.readinessScore} / 100</span>
          </p>
        </div>

        <div className="card">
          <h2 className="mb-3 text-lg font-bold text-scan-text">Recommended first deployment</h2>
          {deploymentOrder.length === 0 ? (
            <p className="text-sm text-scan-muted">No opportunities defined yet — head back to Business Profile.</p>
          ) : (
            <ol className="list-decimal space-y-1.5 pl-4 text-sm text-scan-text">
              {deploymentOrder.map((o) => (
                <li key={o.opportunity}>{o.opportunity}</li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-2 text-lg font-bold text-scan-text">Next action</h2>
        <p className="mb-4 text-sm text-scan-muted">
          Book an implementation strategy session to validate assumptions, connect data sources, and finalize the AI workforce deployment plan.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`mailto:prashanth@growthaspire.com?subject=${encodeURIComponent(
              `AI Transformation follow-up — ${industryLabel}`
            )}`}
            className="btn"
          >
            Book strategy call
          </a>
          <button
            disabled
            title="PDF export ships in the next build phase"
            className="btn-secondary opacity-60"
          >
            Download PDF report
          </button>
        </div>
      </div>
    </div>
  );
}
