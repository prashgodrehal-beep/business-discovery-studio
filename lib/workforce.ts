import { GeneratedResults } from "./types";
import { investmentAssumptions } from "./assumptions";

export type AgentPhase = "start" | "priority" | "roadmap";

export interface WorkforceAgent {
  label: string;
  phase: AgentPhase;
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
// Only steps whose label contains "Agent" count as a named specialist.
// However many pain points are selected, only the top N (by priority) are
// tagged "start" — the rest become "priority" (relevant, but phase 2) or
// "roadmap" (not tied to a selected pain point at all).
export function buildWorkforceOrg(departmentWorkflows: GeneratedResults["departmentWorkflows"]): WorkforceOrg {
  const priorityLabels: string[] = [];
  const roadmapLabels: string[] = [];
  const seen = new Set<string>();
  const humanRoles: HumanRoleGroup[] = [];
  let supervisorLabel: string | null = null;

  for (const dept of departmentWorkflows) {
    for (const step of dept.future) {
      if (step.owner === "ai" && step.label.includes("Agent") && !seen.has(step.label)) {
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
    ...priorityLabels.map((label, i) => ({ label, phase: (i < startCount ? "start" : "priority") as AgentPhase })),
    ...roadmapLabels.map((label) => ({ label, phase: "roadmap" as AgentPhase })),
  ];

  const supervisor: WorkforceAgent | null = supervisorLabel ? { label: supervisorLabel, phase: "start" } : null;
  return { supervisor, specialists, humanRoles };
}
