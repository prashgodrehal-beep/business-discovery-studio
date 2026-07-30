"use client";

import { GeneratedResults } from "@/lib/types";
import { buildWorkforceOrg } from "@/lib/workforce";
import AIWorkforceOrg from "../AIWorkforceOrg";
import { StepHeading } from "../ResultsPrimitives";

export default function AIWorkforceStep({ results }: { results: GeneratedResults }) {
  const org = buildWorkforceOrg(results.departmentWorkflows, results.maturity);

  return (
    <div>
      <StepHeading
        eyebrow="Step 6"
        title="AI workforce org"
        lead="Not a tool list — a coordinated team: a supervisor agent orchestrating specialists, a reflection layer before anything reaches a human, and humans keeping the final call on high-stakes decisions."
      />
      <div className="card">
        <AIWorkforceOrg org={org} />
      </div>
      <p className="mt-4 text-sm text-scan-muted">
        <span className="text-scan-teal">Start now</span> is capped at a realistic launch set — the rest is priority (phase 2) or
        roadmap, not a 10-agent day-one ask.
      </p>
    </div>
  );
}
