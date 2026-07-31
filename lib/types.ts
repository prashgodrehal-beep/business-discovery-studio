export type DepartmentKey =
  | "sales"
  | "support"
  | "ceo"
  | "marketing"
  | "customerSuccess"
  | "finance"
  | "hr"
  | "operations";

export type PainPointKey =
  | "unqualified_leads"
  | "manual_followup"
  | "repetitive_questions"
  | "too_many_approvals"
  | "manual_onboarding"
  | "poor_campaign_roi"
  | "cash_flow_delays"
  | "operational_bottlenecks";

// Optional deep-dive numbers. Everything here is optional — when present,
// the rules engine uses them to CALCULATE figures bottom-up (funnel math on
// real numbers) instead of applying a directional percentage range.
export interface BusinessMetrics {
  headcount: Partial<Record<DepartmentKey, number>>;
  marketingSpendMonthly?: number;
  salesTeamCostMonthly?: number;
  supportTeamCostMonthly?: number;
  monthlyLeads?: number;
  conversionRatePct?: number;
  avgResponseTimeHours?: number;
  monthlyRevenue?: number;
  growthTargetPct?: number; // their own 6-12 month target, for comparison
  currentApprovalHoursPerWeek?: number; // lets CEO time-saved be calculated, not a headcount guess
  repetitiveTicketsPct?: number; // lets support savings be calculated, not a flat assumption
  grossMarginPct?: number; // powers the separate Profit Impact lens — never blended into payback
}

export interface DataReadiness {
  dataLocation: string; // e.g. "Excel", "CRM", "Paper records", "Mixed"
  hasDashboards: "yes" | "partial" | "no" | "";
  dataQuality: "poor" | "fair" | "good" | "excellent" | "";
  notes: string;
}

export type TechMaturity = "not_in_place" | "underused" | "well_utilized" | "";

export interface TechStackEntry {
  tools: string[]; // multi-select — some businesses run more than one tool per category
  maturity: TechMaturity;
}

export type AIUsageMaturity = "adhoc" | "team_habit" | "deeply_integrated" | "";

export interface AIAdoptionEntry {
  department: DepartmentKey;
  purposes: string[]; // e.g. content drafting, research, customer replies, data analysis, coding
  maturity: AIUsageMaturity;
}

export type FocusGoal = "revenue" | "profit" | "cost" | "efficiency" | "";
export type FocusArea = "customer_facing" | "internal" | "";
export type IndustryArchetype = "real_estate" | "coaching_education" | "healthcare_pharma" | "retail_d2c" | "generic_b2b" | "generic_b2c" | "";

export interface BusinessProfile {
  websiteUrl: string;
  focusGoal: FocusGoal;
  focusArea: FocusArea;
  industryArchetype: IndustryArchetype;
  company: {
    industry: string;
    businessModel: "B2B" | "B2C" | "Both" | "";
    businessType: "service" | "product" | "hybrid" | "";
    productsServices: string[];
    annualRevenue?: number; // exact ₹, not a band
    employeeCount: string;
    locations: number;
    growthObjectives: string[];
  };
  customer: {
    idealCustomer: string;
    averageDealSize?: number; // exact ₹, not a band
    buyingCycle: string;
    customerJourney: string[];
    repeatBusiness: string;
    supportExpectations: string[];
  };
  departments: DepartmentKey[];
  techStack: Record<string, TechStackEntry>;
  aiAdoption: AIAdoptionEntry[];
  painPoints: PainPointKey[];
  otherPainPoints: string;
  metrics: BusinessMetrics;
  dataReadiness: DataReadiness;
}

// "system" = infrastructure / external touchpoint (a website, a CRM, the
// customer themselves) — deliberately not "human" or "ai" so the diagram
// never implies a tool is a role.
export type StepOwner = "human" | "ai" | "collaborative" | "system";

export interface WorkflowStep {
  label: string;
  owner: StepOwner;
}

export interface DepartmentTemplate {
  label: string;
  hasTemplate: boolean;
  mandatory: boolean;
  currentWorkflow: WorkflowStep[];
  futureWorkflow: WorkflowStep[];
  // maps a painPointKey to the future-state step label it lights up
  painPointTriggers: Partial<Record<PainPointKey, string>>;
  // maps a painPointKey to the CURRENT-state step label that IS the
  // bottleneck — lets the Current workflow visually flag "this is the
  // problem" instead of only naming it in a separate heatmap table.
  currentPainSteps: Partial<Record<PainPointKey, string>>;
}

export interface EnrichmentResult {
  industry?: string;
  businessModel?: "B2B" | "B2C" | "Both";
  productsServices?: string[];
  growthObjectives?: string[];
  idealCustomer?: string;
  buyingCycle?: string;
  customerJourney?: string[];
  supportExpectations?: string[];
  repeatBusiness?: string;
  confidence: "high" | "medium" | "low";
}

export interface HeatmapRow {
  area: string;
  observation: string;
  impact: "High" | "Medium" | "Low";
}

export interface OpportunityRow {
  opportunity: string;
  roi: "High" | "Medium" | "Low";
  difficulty: "Low" | "Medium" | "High";
  priorityStars: number;
  foundationNeeded?: { note: string };
}

// The Founder Evolution Pyramid / Decision OS Framework, operationalized:
// an AI agent is only as good as the foundation under it. Process/Visibility/
// Automation are assessed from data already in the profile — Intelligence and
// Decision OS are what the agents themselves unlock, not something to assess
// as already present.
export type MaturityLayer = "process" | "visibility" | "automation";

export interface MaturityScores {
  process: number;
  visibility: number;
  automation: number;
  currentLevel: number; // 1-4 assessed today; level 5 (Decision OS) is aspirational
}

// "calculated" = pure arithmetic on real numbers the business gave us, no
// external assumption at all (e.g. leads × conversion rate).
// "estimated" = a real baseline they gave us, multiplied by an assumption
// rate from lib/assumptions.ts (e.g. their approval hours × a reduction %).
// "directional" = no business-specific number at all, just the assumption
// range's point estimate.
export type EstimateSource = "calculated" | "estimated" | "directional";

export interface SourcedNumber {
  value: number;
  source: EstimateSource;
}

// Restructured into the brief's four Financial Impact Assessment dimensions.
// Every figure carries a `source` tag so nothing is presented with false
// confidence — see lib/assumptions.ts for where the ranges come from.
export interface FinancialImpact {
  costSavings: {
    supportCostReductionPct: SourcedNumber;
    supportCostSavingsMonthly?: SourcedNumber;
  };
  revenueGrowth: {
    revenueGrowthPct: SourcedNumber;
    leadLeakageReductionPct: SourcedNumber;
    additionalRevenueMonthly?: SourcedNumber;
    additionalDealsPerMonth?: SourcedNumber;
    growthTargetPct?: number;
    pctOfTargetClosed?: number;
    impliedDealVolumeIncreasePct?: number; // recovered deals as a % of existing deal volume — the real check for high-ticket, low-volume businesses
  };
  productivityGains: {
    ceoHoursSavedPerWeek: SourcedNumber;
    productivityBoostPct: SourcedNumber;
  };
  customerExperience: {
    responseTimeReductionPct: SourcedNumber;
    currentResponseTimeHours?: number;
    projectedResponseTimeHours?: number;
  };
}

export interface InvestmentEstimate {
  oneTimeInvestment: number;
  monthlyRecurring: number;
  activeAgentCount: number;
  recommendedStartCount: number; // however many pain points are selected, start with only this many
  monthlyBenefit?: number; // the ₹ figure the payback was computed from, shown for transparency
  paybackDays?: number; // only computable when we have currency benefit figures
}

// A deliberately SEPARATE lens from payback — margin-adjusted, useful for a
// CFO-minded room, but never blended into the Investment & Payback numbers.
// Cost savings count in full (they hit profit dollar-for-dollar); revenue
// growth counts only at the margin rate.
export interface ProfitImpact {
  monthlyProfitImpact: number;
  marginPctUsed: number;
  marginSource: EstimateSource; // "estimated" when the business gave their own margin, "directional" when it's a business-type default
}

export interface GeneratedResults {
  heatmap: HeatmapRow[];
  opportunities: OpportunityRow[];
  financials: FinancialImpact;
  readinessScore: number;
  maturity: MaturityScores;
  profitImpact?: ProfitImpact;
  investment: InvestmentEstimate;
  departmentWorkflows: {
    department: DepartmentKey;
    label: string;
    current: WorkflowStep[];
    future: WorkflowStep[];
    highlightedFutureSteps: string[];
    highlightedCurrentSteps: string[];
  }[];
}
