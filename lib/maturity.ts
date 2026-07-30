import { BusinessProfile, MaturityScores, TechMaturity } from "./types";
import { agentPrerequisites } from "./assumptions";

function techMaturityScore(entry?: { maturity: TechMaturity }): number {
  if (!entry || !entry.maturity) return 40; // unknown — don't penalize hard, don't assume solid either
  if (entry.maturity === "well_utilized") return 100;
  if (entry.maturity === "underused") return 50;
  return 10; // not_in_place
}

// Computes Process/Visibility/Automation purely from data already captured
// elsewhere in the profile — Tech Stack maturity, Data & Systems Readiness,
// and AI Adoption maturity. No new questions needed.
export function computeMaturityScores(profile: BusinessProfile): MaturityScores {
  const crmScore = techMaturityScore(profile.techStack["crm"]);
  const erpScore = techMaturityScore(profile.techStack["erp"]);
  let process = Math.round((crmScore + erpScore) / 2);
  const location = profile.dataReadiness.dataLocation.toLowerCase();
  if ((location.includes("excel") || location.includes("paper")) && !location.includes("crm") && !location.includes("system")) {
    process = Math.max(0, process - 15);
  }

  const dashboardScore =
    profile.dataReadiness.hasDashboards === "yes" ? 100 : profile.dataReadiness.hasDashboards === "partial" ? 55 : profile.dataReadiness.hasDashboards === "no" ? 15 : 40;
  const qualityScoreMap: Record<string, number> = { poor: 15, fair: 45, good: 75, excellent: 100 };
  const qualityScore = qualityScoreMap[profile.dataReadiness.dataQuality] ?? 40;
  const visibility = Math.round((dashboardScore + qualityScore) / 2);

  let automation = 15; // default: minimal automation until proven otherwise
  if (profile.aiAdoption.length > 0) {
    const maturityMap: Record<string, number> = { adhoc: 25, team_habit: 60, deeply_integrated: 100 };
    const scores = profile.aiAdoption.map((a) => maturityMap[a.maturity] ?? 25);
    automation = Math.round(scores.reduce((sum, v) => sum + v, 0) / scores.length);
  }

  const currentLevel = 1 + (process >= 40 ? 1 : 0) + (visibility >= 40 ? 1 : 0) + (automation >= 40 ? 1 : 0);
  return { process, visibility, automation, currentLevel: Math.min(4, currentLevel) };
}

// Matches a label (either an Opportunity Matrix name or a workflow step
// label) against the prerequisite list via substring — so "Lead Agent" and
// "Lead Agent (Sreeja AI)" both resolve to the same prerequisite.
export function checkFoundation(label: string, scores: MaturityScores): { note: string } | undefined {
  const matchKey = Object.keys(agentPrerequisites).find((key) => label.includes(key));
  if (!matchKey) return undefined;
  const prereq = agentPrerequisites[matchKey];
  const score = scores[prereq.layer];
  return score < prereq.minScore ? { note: prereq.note } : undefined;
}
