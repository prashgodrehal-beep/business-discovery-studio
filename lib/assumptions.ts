import type { MaturityLayer } from "./types";

// This file is the single place where every "we assumed X%" number in the
// tool comes from. Nothing here is a borrowed statistic from a marketing
// blog — published numbers in this space (AI chatbot conversion rates,
// support cost reduction, etc.) are wildly inconsistent and mostly SEO
// content, not something worth citing to a client. Instead, these are
// conservative, wide ranges meant to be tuned over time from GrowthAspire's
// own 90+ engagements. Edit these as real outcomes come in.

// Where a range sits between min and max determines how "confident" the
// point estimate looks. 0 = always show the floor (most conservative,
// safest for credibility). 1 = always show the ceiling. Kept below the
// midpoint on purpose — under-promising protects the blueprint's credibility
// far more than a slightly bigger number does.
export const CONFIDENCE_LEAN = 0.4;

export function estimateAt([min, max]: [number, number], lean: number): number {
  return min + (max - min) * lean;
}

export function pointEstimate(range: [number, number]): number {
  return Math.round(estimateAt(range, CONFIDENCE_LEAN));
}

export interface PainPointRange {
  revenueGrowthPct?: [number, number];
  leadLeakageReductionPct?: [number, number];
  responseTimeReductionPct?: [number, number];
  supportCostReductionPct?: [number, number];
  ceoHoursSavedPerWeek?: [number, number];
  productivityBoostPct?: [number, number];
}

// Directional ranges per pain point — used only when we don't have enough of
// the business's own numbers to calculate a figure directly. Conservative
// and wide on purpose.
export const directionalRanges: Record<string, PainPointRange> = {
  unqualified_leads: { revenueGrowthPct: [3, 8], responseTimeReductionPct: [30, 45], leadLeakageReductionPct: [20, 35], productivityBoostPct: [2, 6] },
  manual_followup: { revenueGrowthPct: [4, 10], leadLeakageReductionPct: [15, 28], productivityBoostPct: [3, 7] },
  repetitive_questions: { responseTimeReductionPct: [25, 40], supportCostReductionPct: [15, 28], productivityBoostPct: [4, 8] },
  too_many_approvals: { ceoHoursSavedPerWeek: [5, 12], productivityBoostPct: [5, 10] },
  manual_onboarding: { ceoHoursSavedPerWeek: [2, 4], supportCostReductionPct: [5, 12], productivityBoostPct: [2, 5] },
  poor_campaign_roi: { revenueGrowthPct: [2, 5], productivityBoostPct: [2, 4] },
  cash_flow_delays: { ceoHoursSavedPerWeek: [3, 6], productivityBoostPct: [3, 6] },
  operational_bottlenecks: { ceoHoursSavedPerWeek: [2, 5], productivityBoostPct: [3, 7] },
};

// When the business gives us their own approval-hours baseline, this is the
// range of that baseline we assume AI-assisted exception routing can remove.
export const approvalHoursReductionRange: [number, number] = [0.6, 0.75];

// When the business tells us what % of support tickets are repetitive, this
// is the range of THAT repetitive-ticket cost we assume is actually
// automatable (not 100% — some still need a human even if repetitive).
export const supportAutomationCaptureRange: [number, number] = [0.7, 0.85];

// --- Agent-as-hire-equivalent framing ---
// A separate, complementary lens to the funnel-based Financial Impact above.
// Instead of "how much extra revenue leaks in," this answers "what would it
// cost to buy this same capacity by hiring someone" — often a far more
// persuasive comparison, since the funnel math is deliberately conservative.
// Not additive to the Financial Impact numbers — a different way of valuing
// the same agent, shown side by side so the room can pick whichever lands.
export const agentHumanEquivalent: Record<string, { roleLabel: string; department: string; fraction: [number, number] }> = {
  "Lead Intelligence Analyst": { roleLabel: "SDR / lead qualifier", department: "sales", fraction: [0.5, 1.0] },
  "Follow-up Coordinator": { roleLabel: "sales follow-up coordinator", department: "sales", fraction: [0.4, 0.8] },
  "Knowledge Resolver": { roleLabel: "support agent", department: "support", fraction: [0.6, 1.0] },
  "Campaign Optimizer": { roleLabel: "marketing analyst", department: "marketing", fraction: [0.3, 0.6] },
  "Supervisor Agent (CEO Command Center)": { roleLabel: "executive assistant / chief of staff", department: "ceo", fraction: [0.3, 0.5] },
  "Onboarding Guide": { roleLabel: "HR coordinator", department: "hr", fraction: [0.3, 0.6] },
  "Collections Coordinator": { roleLabel: "AR / collections specialist", department: "finance", fraction: [0.4, 0.8] },
  "Exception Monitor": { roleLabel: "operations coordinator", department: "operations", fraction: [0.4, 0.7] },
};

// Fallback fully-loaded monthly cost band per department when we don't have
// their own headcount + team-cost numbers to calculate a real cost-per-head.
export const typicalFullyLoadedMonthlyCost: Record<string, [number, number]> = {
  sales: [40000, 70000],
  support: [25000, 45000],
  marketing: [35000, 60000],
  ceo: [80000, 150000],
  hr: [30000, 50000],
  customerSuccess: [30000, 50000],
  finance: [35000, 60000],
  operations: [30000, 55000],
};

// --- Maturity Layer prerequisites (Founder Evolution Pyramid / Decision OS) ---
// An agent is only as good as the foundation under it — a Follow-up
// Coordinator is useless without a CRM to follow up from; a Deal Coach is useless
// without dashboards to analyze. Keys are matched against both the
// Opportunity Matrix name and the workflow step label via string.includes(),
// so keep them as the short, branding-free core phrase both share.
export const agentPrerequisites: Record<string, { layer: MaturityLayer; minScore: number; note: string }> = {
  "Lead Intelligence Analyst": { layer: "process", minScore: 40, note: "Needs a CRM or clear lead-tracking process in place" },
  "Follow-up Coordinator": { layer: "process", minScore: 40, note: "Needs a CRM or clear process to know who to follow up with" },
  "Knowledge Resolver": { layer: "process", minScore: 30, note: "Needs at least a basic knowledge base or FAQ doc" },
  "Supervisor Agent": { layer: "visibility", minScore: 50, note: "Needs dashboards/reporting to make decisions from" },
  "Campaign Optimizer": { layer: "visibility", minScore: 40, note: "Needs campaign data/dashboards to analyze" },
  "Onboarding Guide": { layer: "process", minScore: 30, note: "Needs a documented onboarding process" },
  "Collections Coordinator": { layer: "process", minScore: 35, note: "Needs an invoicing/accounting system to track against" },
  "Exception Monitor": { layer: "visibility", minScore: 40, note: "Needs monitoring/dashboards to detect exceptions from" },
};

// --- Business-type-aware modeling ---
// Two businesses with identical revenue can have wildly different economics.
// A consultancy scaling sales effectiveness grows revenue close to linearly
// with capacity; a manufacturer is capped by production capacity — its real
// AI upside is usually margin improvement, not top-line growth. These are
// starting points from GrowthAspire's own engagements — tune freely.
export const defaultMarginPctByBusinessType: Record<string, number> = {
  service: 55,
  product: 28,
  hybrid: 40,
};

// Revenue-growth ceiling only ever goes UP for service businesses (capacity
// genuinely scales with effectiveness there) — product/manufacturing keeps
// today's conservative cap unchanged, since production capacity is the real
// constraint, not sales effectiveness.
export const revenueGrowthCapByBusinessType: Record<string, number> = {
  service: 50,
  product: 35,
  hybrid: 40,
  "": 35, // unknown business type — unchanged default, no regression
};

export const investmentAssumptions = {
  // One-time setup, tiered by how many agents are in scope — ₹2L-3L band.
  oneTimeInvestmentByAgentCount: (agentCount: number): number => {
    if (agentCount <= 2) return 200000;
    if (agentCount <= 4) return 250000;
    return 300000;
  },
  // Monthly recurring — ₹20K base (includes infra) covers the first agent,
  // each additional agent adds a smaller increment.
  monthlyBaseFee: 20000,
  monthlyPerAdditionalAgent: 8000,
  minPaybackDays: 30,
  // However many pain points are selected, only recommend starting with this
  // many agents at once — the rest become a phase-2 roadmap, not a launch list.
  recommendedStartCount: 4,
};
