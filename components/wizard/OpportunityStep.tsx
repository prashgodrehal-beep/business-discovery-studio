"use client";

import { BusinessProfile, GeneratedResults } from "@/lib/types";
import { aiRoleCatalog } from "@/lib/aiRoleCatalog";
import { departmentTemplates } from "@/lib/departmentTemplates";
import ReadinessScore from "../ReadinessScore";
import MaturityLadder from "../MaturityLadder";
import { StepHeading } from "../ResultsPrimitives";

export default function OpportunityStep({ profile, results }: { profile: BusinessProfile; results: GeneratedResults }) {
  const workforce = Array.from(
    new Map(results.opportunities.map((o) => [o.opportunity, o.foundationNeeded])).entries()
  );
  const recommendedNames = new Set(workforce.map(([label]) => label));

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
        <div className="mb-6 card">
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

      <div className="card">
        <h2 className="mb-1 text-lg font-bold text-scan-text">Full AI role portfolio</h2>
        <p className="mb-4 text-sm text-scan-muted">
          Not just what's triggered by the pain points picked so far — the whole possibility space for every department in scope.
          Teal = already recommended above; the rest is what else this business could deploy.
        </p>
        <div className="space-y-5">
          {profile.departments
            .filter((d) => aiRoleCatalog[d])
            .map((d) => (
              <div key={d}>
                <p className="mb-2 text-sm font-bold text-scan-text">{departmentTemplates[d].label}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {aiRoleCatalog[d]!.map((role) => {
                    const isRecommended = recommendedNames.has(role.name);
                    return (
                      <div
                        key={role.name}
                        className={`rounded-xl border p-3 ${isRecommended ? "border-scan-teal bg-scan-tealDim" : "border-scan-border bg-scan-surface2"}`}
                      >
                        <p className={`text-sm font-semibold ${isRecommended ? "text-scan-teal" : "text-scan-text"}`}>{role.name}</p>
                        <p className="mt-0.5 text-xs text-scan-muted">{role.mission}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-scan-muted">Metric: {role.metric}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
