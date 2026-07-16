"use client";

import { GeneratedResults } from "@/lib/types";
import ReadinessScore from "../ReadinessScore";
import { StepHeading } from "../ResultsPrimitives";

export default function OpportunityStep({ results }: { results: GeneratedResults }) {
  const workforce = Array.from(new Set(results.opportunities.map((o) => o.opportunity)));

  return (
    <div>
      <StepHeading eyebrow="Step 4" title="AI opportunity discovery" lead="Where AI creates the most value first, prioritized by ROI and ease of deployment." />

      <div className="mb-6 card">
        <ReadinessScore score={results.readinessScore} />
      </div>

      <div className="mb-6 card">
        <h2 className="mb-4 text-lg font-bold text-scan-text">AI opportunity matrix</h2>
        {results.opportunities.length === 0 ? (
          <p className="text-sm text-scan-muted">No pain points selected yet — head back to Business Profile.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {results.opportunities.map((opp, i) => (
              <div key={i} className="rounded-md border border-scan-border bg-scan-surface2 p-4">
                <p className="text-sm text-scan-text">{opp.opportunity}</p>
                <div className="mt-2 flex items-center gap-3 font-mono text-xs text-scan-muted">
                  <span>ROI: {opp.roi}</span>
                  <span>Difficulty: {opp.difficulty}</span>
                  <span className="text-scan-teal">
                    {"★".repeat(opp.priorityStars)}
                    {"☆".repeat(5 - opp.priorityStars)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {workforce.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-scan-text">Recommended AI workforce</h2>
          <div className="flex flex-wrap gap-2">
            {workforce.map((w) => (
              <span key={w} className="rounded-full border border-scan-teal bg-scan-tealDim px-3 py-1.5 text-sm text-scan-teal">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
