import { GeneratedResults, MaturityScores } from "./types";
import { investmentAssumptions } from "./assumptions";
import { checkFoundation } from "./maturity";

export type AgentPhase = "start" | "priority" | "roadmap";

export interface WorkforceAgent {
  label: string;
  phase: AgentPhase;
  foundationNote?: string;
}

export interface HumanRoleGroup {
  department: string;
  roles: string[];
}

export interface WorkforceOrg {
  supervisor: WorkforceAgent | null;
  specialists: WorkforceAgent[];
  humanRoles: HumanRoleGroup[];
}

// Pulls the org structure straight out of the same department workflow config
// that drives Deliverables 2/5/6 — no separate hardcoded roster to keep in sync.
// Every AI-owned step counts as a named specialist — roles are named after
// the job they perform (Lead Intelligence Analyst, Collections Coordinator),
// so there's no more generic "Agent" suffix to filter on.
// However many pain points are selected, only the top N (by priority) are
// tagged "start" — the rest become "priority" (relevant, but phase 2) or
// "roadmap" (not tied to a selected pain point at all). Independently, every
// agent is checked against the Maturity Layer — an agent can be "start now"
// priority-wise and still carry a "foundation needed first" caveat.
export function buildWorkforceOrg(departmentWorkflows: GeneratedResults["departmentWorkflows"], maturity: MaturityScores): WorkforceOrg {
  const priorityLabels: string[] = [];
  const roadmapLabels: string[] = [];
  const seen = new Set<string>();
  const humanRoles: HumanRoleGroup[] = [];
  let supervisorLabel: string | null = null;

  for (const dept of departmentWorkflows) {
    for (const step of dept.future) {
      if (step.owner === "ai" && !seen.has(step.label)) {
        seen.add(step.label);
        if (step.label.startsWith("Supervisor Agent")) {
          supervisorLabel = step.label;
        } else if (dept.highlightedFutureSteps.includes(step.label)) {
          priorityLabels.push(step.label);
        } else {
          roadmapLabels.push(step.label);
        }
      }
    }
    const humanHere = Array.from(
      new Set(dept.future.filter((s) => s.owner === "human" || s.owner === "collaborative").map((s) => s.label))
    );
    if (humanHere.length > 0) humanRoles.push({ department: dept.label, roles: humanHere });
  }

  const startCount = investmentAssumptions.recommendedStartCount;
  const specialists: WorkforceAgent[] = [
    ...priorityLabels.map((label, i) => ({
      label,
      phase: (i < startCount ? "start" : "priority") as AgentPhase,
      foundationNote: checkFoundation(label, maturity)?.note,
    })),
    ...roadmapLabels.map((label) => ({ label, phase: "roadmap" as AgentPhase, foundationNote: checkFoundation(label, maturity)?.note })),
  ];

  const supervisor: WorkforceAgent | null = supervisorLabel
    ? { label: supervisorLabel, phase: "start", foundationNote: checkFoundation(supervisorLabel, maturity)?.note }
    : null;
  return { supervisor, specialists, humanRoles };
}
