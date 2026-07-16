"use client";

import { GeneratedResults } from "@/lib/types";
import WorkflowDiagram from "../WorkflowDiagram";
import { StepHeading } from "../ResultsPrimitives";

export default function FutureWorkflowStep({ results }: { results: GeneratedResults }) {
  const roadmap = [...results.opportunities]
    .sort((a, b) => b.priorityStars - a.priorityStars)
    .slice(0, 3)
    .map((o) => o.opportunity);

  return (
    <div>
      <StepHeading
        eyebrow="Step 5"
        title="Human + AI collaboration model"
        lead="The 'aha' moment: watch work move out of the Human lane and into the AI lane — humans keep judgment and relationships, AI takes speed, consistency, and repetitive execution."
      />

      <div className="mb-6 card">
        {results.departmentWorkflows.length === 0 ? (
          <p className="text-sm text-scan-muted">No departments with workflows in scope yet — check Business Profile.</p>
        ) : (
          <div className="space-y-10">
            {results.departmentWorkflows.map((dept) => (
              <div key={dept.department}>
                <p className="mb-3 text-base font-bold text-scan-text">{dept.label}</p>
                <p className="mb-1 text-xs uppercase tracking-wide text-scan-muted">Current</p>
                <WorkflowDiagram steps={dept.current} bottleneck={dept.highlightedCurrentSteps} playScan={false} />
                <p className="mb-1 mt-4 text-xs uppercase tracking-wide text-scan-teal">Future</p>
                <WorkflowDiagram steps={dept.future} highlighted={dept.highlightedFutureSteps} playScan={true} />
              </div>
            ))}
          </div>
        )}
      </div>

      {roadmap.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-scan-text">90-day roadmap</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {roadmap.map((label, i) => (
              <div key={label} className="card-light">
                <p className="text-xs uppercase tracking-wide text-scan-teal">Month {i + 1}</p>
                <p className="mt-1 text-sm text-scan-text">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
