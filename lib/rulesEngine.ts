import {
  BusinessProfile,
  GeneratedResults,
  HeatmapRow,
  OpportunityRow,
  FinancialImpact,
  PainPointKey,
  InvestmentEstimate,
  SourcedNumber,
} from "./types";
import { departmentTemplates, painPointOptions } from "./departmentTemplates";
import {
  directionalRanges,
  pointEstimate,
  approvalHoursReductionRange,
  supportAutomationCaptureRange,
  investmentAssumptions,
  defaultMarginPctByBusinessType,
  revenueGrowthCapByBusinessType,
} from "./assumptions";
import { computeMaturityScores, checkFoundation } from "./maturity";

// Deterministic pain-point -> AI opportunity mapping. This is the "Dynamic
// Matrix Engine" — no AI call, instant results. Names are kept consistent
// with the workflow step labels in departmentTemplates.ts (no "/" combos)
// so the Maturity Layer's prerequisite matching works via simple substring.
const opportunityMap: Record<PainPointKey, OpportunityRow> = {
  unqualified_leads: { opportunity: "Lead Intelligence Analyst", roi: "High", difficulty: "Low", priorityStars: 5 },
  manual_followup: { opportunity: "Follow-up Coordinator", roi: "High", difficulty: "Medium", priorityStars: 4 },
  repetitive_questions: { opportunity: "Knowledge Resolver", roi: "High", difficulty: "Low", priorityStars: 4 },
  too_many_approvals: { opportunity: "Supervisor Agent (CEO Command Center)", roi: "Medium", difficulty: "Medium", priorityStars: 3 },
  manual_onboarding: { opportunity: "Onboarding Guide", roi: "Medium", difficulty: "Medium", priorityStars: 3 },
  poor_campaign_roi: { opportunity: "Campaign Optimizer", roi: "Medium", difficulty: "Medium", priorityStars: 3 },
  cash_flow_delays: { opportunity: "Collections Coordinator", roi: "High", difficulty: "Medium", priorityStars: 4 },
  operational_bottlenecks: { opportunity: "Exception Monitor", roi: "Medium", difficulty: "Medium", priorityStars: 3 },
};

function cap(n: number, max: number) {
  return Math.min(Math.round(n), max);
}

// Sums the directional point-estimate contribution of every selected pain
// point for one metric — the "no business-specific numbers at all" fallback,
// always tagged "directional" by the caller.
function sumDirectional(painPoints: PainPointKey[], metric: keyof (typeof directionalRanges)[string]): number {
  let total = 0;
  for (const key of painPoints) {
    const range = directionalRanges[key]?.[metric];
    if (range) total += pointEstimate(range);
  }
  return total;
}

// A "calculated" funnel result is more trustworthy than a directional
// guess, so it's allowed some headroom above the directional cap — but that
// headroom itself must be business-type-aware. A product/manufacturing
// business is capacity-constrained no matter how the funnel math comes out,
// so it gets almost no extra headroom; a service business's capacity
// genuinely scales with effectiveness, so it gets much more.
const calculatedGrowthBufferByBusinessType: Record<string, number> = {
  service: 25,
  product: 0,
  hybrid: 10,
  "": 25, // unknown business type — unchanged prior behavior
};

export function generateResults(profile: BusinessProfile): GeneratedResults {
  const selectedPainPoints = profile.painPoints;
  const m = profile.metrics;

  const heatmap: HeatmapRow[] = painPointOptions
    .filter((p) => selectedPainPoints.includes(p.key as PainPointKey))
    .map((p) => ({ area: p.area, observation: p.label, impact: p.impact }));

  const maturity = computeMaturityScores(profile);
  const opportunities: OpportunityRow[] = selectedPainPoints.map((key) => ({
    ...opportunityMap[key],
    foundationNeeded: checkFoundation(opportunityMap[key].opportunity, maturity),
  }));

  // --- Revenue growth ---
  const leadLeakageReductionPct: SourcedNumber = {
    value: cap(sumDirectional(selectedPainPoints, "leadLeakageReductionPct"), 70),
    source: "directional",
  };

  let additionalDealsPerMonth: SourcedNumber | undefined;
  let additionalRevenueMonthly: SourcedNumber | undefined;

  // Calculated tier: keep the deal count FRACTIONAL all the way through the
  // ₹ math — rounding it to a whole deal before multiplying by a large deal
  // size creates a cliff-edge (0.92 deals rounds to 1, swinging the revenue
  // figure by a full deal size in one step). Only round for display text.
  if (m.monthlyLeads && m.conversionRatePct && leadLeakageReductionPct.value > 0) {
    const recoveredLeads = m.monthlyLeads * (leadLeakageReductionPct.value / 100);
    const dealsFractional = recoveredLeads * (m.conversionRatePct / 100);
    additionalDealsPerMonth = { value: Math.round(dealsFractional * 10) / 10, source: "calculated" };

    if (profile.customer.averageDealSize) {
      additionalRevenueMonthly = { value: Math.round(dealsFractional * profile.customer.averageDealSize), source: "calculated" };
    }
  }

  let revenueGrowthPct: SourcedNumber;
  const growthCap = revenueGrowthCapByBusinessType[profile.company.businessType] ?? 35;
  const calculatedCap = growthCap + (calculatedGrowthBufferByBusinessType[profile.company.businessType] ?? 25);

  // Cap the ₹ figure itself, not just the derived % — capping only the %
  // while leaving the ₹ uncapped would reintroduce the exact "these two
  // numbers contradict each other" bug fixed earlier.
  if (additionalRevenueMonthly?.source === "calculated" && m.monthlyRevenue) {
    const impliedPct = (additionalRevenueMonthly.value / m.monthlyRevenue) * 100;
    if (impliedPct > calculatedCap) {
      const cappedValue = Math.round(m.monthlyRevenue * (calculatedCap / 100));
      const scaleFactor = cappedValue / additionalRevenueMonthly.value;
      additionalRevenueMonthly = { value: cappedValue, source: "calculated" };
      // Scale the displayed deal count by the same factor — otherwise "+2.2
      // deals/mo" would sit next to a ₹ figure that no longer implies 2.2
      // deals, quietly contradicting each other again.
      if (additionalDealsPerMonth) {
        additionalDealsPerMonth = { value: Math.round(additionalDealsPerMonth.value * scaleFactor * 10) / 10, source: "calculated" };
      }
    }
  }

  if (additionalRevenueMonthly?.source === "calculated" && m.monthlyRevenue) {
    // Derive the % FROM the ₹ figure instead of computing both separately —
    // otherwise the % and the ₹ can quietly contradict each other in the UI.
    revenueGrowthPct = { value: cap((additionalRevenueMonthly.value / m.monthlyRevenue) * 100, calculatedCap), source: "calculated" };
  } else {
    revenueGrowthPct = { value: cap(sumDirectional(selectedPainPoints, "revenueGrowthPct"), growthCap), source: "directional" };
    if (!additionalRevenueMonthly && m.monthlyRevenue && revenueGrowthPct.value > 0) {
      additionalRevenueMonthly = { value: Math.round(m.monthlyRevenue * (revenueGrowthPct.value / 100)), source: "estimated" };
    }
  }

  // --- Productivity gains ---
  const productivityBoostPct: SourcedNumber = { value: cap(sumDirectional(selectedPainPoints, "productivityBoostPct"), 30), source: "directional" };

  let ceoHoursSavedPerWeek: SourcedNumber;
  if (m.currentApprovalHoursPerWeek) {
    const reductionPct = pointEstimate(approvalHoursReductionRange) * 100;
    ceoHoursSavedPerWeek = { value: Math.round(m.currentApprovalHoursPerWeek * (reductionPct / 100)), source: "estimated" };
  } else {
    const directionalHours = sumDirectional(selectedPainPoints, "ceoHoursSavedPerWeek");
    const ceoReports = m.headcount.ceo;
    const scaled = ceoReports ? directionalHours * (1 + Math.min(ceoReports, 15) / 15) : directionalHours;
    ceoHoursSavedPerWeek = { value: cap(scaled, 30), source: "directional" };
  }

  // --- Cost savings ---
  const supportCostReductionPctDirectional = cap(sumDirectional(selectedPainPoints, "supportCostReductionPct"), 55);
  let supportCostReductionPct: SourcedNumber = { value: supportCostReductionPctDirectional, source: "directional" };
  let supportCostSavingsMonthly: SourcedNumber | undefined;

  if (m.repetitiveTicketsPct && m.supportTeamCostMonthly) {
    const captureRate = pointEstimate(supportAutomationCaptureRange);
    const effectivePct = Math.round(m.repetitiveTicketsPct * captureRate);
    supportCostReductionPct = { value: cap(effectivePct, 60), source: "estimated" };
    supportCostSavingsMonthly = { value: Math.round(m.supportTeamCostMonthly * (supportCostReductionPct.value / 100)), source: "estimated" };
  } else if (m.supportTeamCostMonthly && supportCostReductionPctDirectional > 0) {
    supportCostSavingsMonthly = { value: Math.round(m.supportTeamCostMonthly * (supportCostReductionPctDirectional / 100)), source: "estimated" };
  }

  // --- Customer experience ---
  const responseTimeReductionPct: SourcedNumber = {
    value: cap(sumDirectional(selectedPainPoints, "responseTimeReductionPct"), 95),
    source: "directional",
  };
  let currentResponseTimeHours: number | undefined;
  let projectedResponseTimeHours: number | undefined;
  if (m.avgResponseTimeHours) {
    currentResponseTimeHours = m.avgResponseTimeHours;
    projectedResponseTimeHours = Math.round(m.avgResponseTimeHours * (1 - responseTimeReductionPct.value / 100) * 10) / 10;
  }

  const financials: FinancialImpact = {
    costSavings: { supportCostReductionPct, supportCostSavingsMonthly },
    revenueGrowth: { revenueGrowthPct, leadLeakageReductionPct, additionalRevenueMonthly, additionalDealsPerMonth },
    productivityGains: { ceoHoursSavedPerWeek, productivityBoostPct },
    customerExperience: { responseTimeReductionPct, currentResponseTimeHours, projectedResponseTimeHours },
  };

  if (m.growthTargetPct && m.growthTargetPct > 0) {
    financials.revenueGrowth.growthTargetPct = m.growthTargetPct;
    financials.revenueGrowth.pctOfTargetClosed = cap((revenueGrowthPct.value / m.growthTargetPct) * 100, 999);
  }

  const departmentWorkflows = profile.departments
    .map((deptKey) => {
      const t = departmentTemplates[deptKey];
      if (!t.hasTemplate) return null;
      const highlightedFutureSteps = Object.entries(t.painPointTriggers)
        .filter(([painKey]) => selectedPainPoints.includes(painKey as PainPointKey))
        .map(([, step]) => step);
      const highlightedCurrentSteps = Object.entries(t.currentPainSteps)
        .filter(([painKey]) => selectedPainPoints.includes(painKey as PainPointKey))
        .map(([, step]) => step);
      return { department: deptKey, label: t.label, current: t.currentWorkflow, future: t.futureWorkflow, highlightedFutureSteps, highlightedCurrentSteps };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const readinessScore = computeReadinessScore(profile);

  const monthlyBenefit = (additionalRevenueMonthly?.value ?? 0) + (supportCostSavingsMonthly?.value ?? 0);
  const investment = computeInvestment(opportunities.length, monthlyBenefit);

  // Profit Impact — deliberately kept OUT of the payback calculation above.
  // Cost savings count in full; revenue growth counts only at margin rate.
  let profitImpact: GeneratedResults["profitImpact"];
  if (additionalRevenueMonthly !== undefined || supportCostSavingsMonthly !== undefined) {
    const marginPctUsed = m.grossMarginPct ?? defaultMarginPctByBusinessType[profile.company.businessType] ?? defaultMarginPctByBusinessType.hybrid;
    const marginSource: "estimated" | "directional" = m.grossMarginPct ? "estimated" : "directional";
    const monthlyProfitImpact = Math.round((additionalRevenueMonthly?.value ?? 0) * (marginPctUsed / 100) + (supportCostSavingsMonthly?.value ?? 0));
    profitImpact = { monthlyProfitImpact, marginPctUsed, marginSource };
  }

  return { heatmap, opportunities, financials, readinessScore, maturity, profitImpact, investment, departmentWorkflows };
}

const impactWeight: Record<"High" | "Medium" | "Low", number> = { High: 12, Medium: 7, Low: 4 };

function computeReadinessScore(profile: BusinessProfile): number {
  let score = 40;
  for (const key of profile.painPoints) {
    const opt = painPointOptions.find((p) => p.key === key);
    if (opt) score += impactWeight[opt.impact];
  }
  const hasAdvancedAI = profile.aiAdoption.some((a) => a.maturity === "deeply_integrated");
  const hasNoAI = profile.aiAdoption.length === 0;
  if (hasNoAI) score += 5;
  if (hasAdvancedAI) score -= 5;
  return Math.max(20, Math.min(96, Math.round(score)));
}

function computeInvestment(activeAgentCount: number, monthlyBenefit: number): InvestmentEstimate {
  if (activeAgentCount === 0) return { monthlyRecurring: 0, oneTimeInvestment: 0, activeAgentCount: 0, recommendedStartCount: 0 };

  const oneTimeInvestment = investmentAssumptions.oneTimeInvestmentByAgentCount(activeAgentCount);
  const monthlyRecurring = investmentAssumptions.monthlyBaseFee + (activeAgentCount - 1) * investmentAssumptions.monthlyPerAdditionalAgent;
  const recommendedStartCount = Math.min(activeAgentCount, investmentAssumptions.recommendedStartCount);

  if (monthlyBenefit <= 0) return { oneTimeInvestment, monthlyRecurring, activeAgentCount, recommendedStartCount };

  // First-outlay payback: one-time setup + first month's recurring, against
  // the monthly benefit. Floored so a strong result never looks implausible.
  const rawPaybackDays = ((oneTimeInvestment + monthlyRecurring) / monthlyBenefit) * 30;
  const paybackDays = Math.max(investmentAssumptions.minPaybackDays, Math.round(rawPaybackDays));

  return {
    oneTimeInvestment,
    monthlyRecurring,
    activeAgentCount,
    recommendedStartCount,
    monthlyBenefit: Math.round(monthlyBenefit),
    paybackDays,
  };
}
