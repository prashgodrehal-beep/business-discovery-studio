"use client";

import { GeneratedResults } from "@/lib/types";
import ReadinessScore from "../ReadinessScore";
import MaturityLadder from "../MaturityLadder";
import { StepHeading } from "../ResultsPrimitives";

export default function OpportunityStep({ results }: { results: GeneratedResults }) {
  const workforce = Array.from(
    new Map(results.opportunities.map((o) => [o.opportunity, o.foundationNeeded])).entries()
  );

  return (
    <div>
      <StepHeading eyebrow="Step 4" title="AI opportunity discovery" lead="Where AI creates the most value first, prioritized by ROI and ease of deployment — and whether the foundation is ready for it." />

      <div className="mb-6 card">
        <ReadinessScore score={results.readinessScore} />
      </div>

      <div className="mb-6 card">
        <h2 className="mb-1 text-lg font-bold text-scan-text">Maturity layer</h2>
        <p className="mb-4 text-sm text-scan-muted">
          The Founder Evolution Pyramid, applied: an AI agent is only as good as the process, visibility, and automation underneath
          it. Computed from Tech Stack, Data Readiness, and AI Adoption already captured — no extra questions.
        </p>
        <MaturityLadder maturity={results.maturity} />
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
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-scan-muted">
                  <span>ROI: {opp.roi}</span>
                  <span>Difficulty: {opp.difficulty}</span>
                  <span className="text-scan-teal">
                    {"★".repeat(opp.priorityStars)}
                    {"☆".repeat(5 - opp.priorityStars)}
                  </span>
                </div>
                {opp.foundationNeeded && (
                  <p className="mt-2 rounded-md bg-scan-amberDim px-2 py-1 text-xs text-scan-amber">
                    ⚠ Foundation needed: {opp.foundationNeeded.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {workforce.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-scan-text">Recommended AI workforce</h2>
          <div className="flex flex-wrap gap-2">
            {workforce.map(([label, foundationNeeded]) => (
              <span
                key={label}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  foundationNeeded ? "border-scan-amber bg-scan-amberDim text-scan-amber" : "border-scan-teal bg-scan-tealDim text-scan-teal"
                }`}
                title={foundationNeeded?.note}
              >
                {label}
                {foundationNeeded ? " ⚠" : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
