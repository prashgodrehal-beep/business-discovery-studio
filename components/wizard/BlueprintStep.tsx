"use client";

import { useState } from "react";
import { BusinessProfile, GeneratedResults } from "@/lib/types";
import { StepHeading } from "../ResultsPrimitives";

export default function BlueprintStep({ profile, results }: { profile: BusinessProfile; results: GeneratedResults }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const deploymentOrder = [...results.opportunities].sort((a, b) => b.priorityStars - a.priorityStars);
  const industryLabel = profile.company.industry || "this business";

  const verdict =
    results.readinessScore >= 75
      ? "high customer-facing AI potential"
      : results.readinessScore >= 55
      ? "solid, well-defined AI opportunity"
      : "early-stage opportunity — foundational fixes come first";

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, results }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-transformation-blueprint-${industryLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Couldn't generate the PDF — try again, or check the server logs if it keeps failing.");
    } finally {
      setDownloading(false);
    }
  }

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
          <button onClick={handleDownload} disabled={downloading} className="btn-secondary disabled:opacity-60">
            {downloading ? "Generating…" : "Download PDF report"}
          </button>
        </div>
        {downloadError && <p className="mt-3 text-sm text-scan-amber">{downloadError}</p>}
      </div>
    </div>
  );
}
