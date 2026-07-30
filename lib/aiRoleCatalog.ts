import { DepartmentKey } from "./types";

// The full possibility space of AI roles per department — independent of
// which pain points are selected. Named after the job the role performs,
// not a branded persona (per the "name agents after the job they perform"
// principle) — "Lead Intelligence Analyst," not "Sreeja AI." This is what
// lets the Studio show a leader everything that's POSSIBLE for their
// business, not just the narrow slice tied to whatever pain points they
// happened to click.
export interface AIRole {
  name: string;
  mission: string; // one-line core responsibility
  metric: string; // primary metric this role is measured against
}

export const aiRoleCatalog: Partial<Record<DepartmentKey, AIRole[]>> = {
  sales: [
    { name: "Lead Intelligence Analyst", mission: "Scores intent, fit and timing; recommends next outreach", metric: "Qualified meeting rate" },
    { name: "Account Researcher", mission: "Builds evidence-based account and stakeholder briefs", metric: "Research time / brief quality" },
    { name: "Deal Coach", mission: "Detects missing stakeholders, stalled actions and commercial risk", metric: "Win rate / stage velocity" },
    { name: "Follow-up Coordinator", mission: "Drafts and schedules context-aware follow-up", metric: "Response rate / inactivity days" },
  ],
  marketing: [
    { name: "Market Signal Analyst", mission: "Tracks customer, competitor and category signals", metric: "Insight-to-campaign time" },
    { name: "Content Repurposing Producer", mission: "Adapts approved ideas across formats and channels", metric: "Output / engagement quality" },
    { name: "Campaign Optimizer", mission: "Monitors performance and recommends budget or creative changes", metric: "CAC / conversion" },
    { name: "Voice-of-Customer Synthesizer", mission: "Clusters calls, reviews and tickets into themes", metric: "Insight adoption" },
  ],
  support: [
    { name: "Knowledge Resolver", mission: "Answers grounded in approved product and policy content", metric: "Resolution / accuracy" },
    { name: "Triage Coordinator", mission: "Classifies urgency, intent and routing", metric: "First response / routing accuracy" },
    { name: "Customer Risk Monitor", mission: "Detects frustration, repeat issues and churn signals", metric: "Save rate / escalations" },
    { name: "Quality Coach", mission: "Reviews interactions and gives targeted coaching", metric: "QA score / coaching adoption" },
  ],
  ceo: [
    { name: "Executive Briefing Agent", mission: "Synthesizes performance, risks and decisions due", metric: "Preparation time / completeness" },
    { name: "Decision Analyst", mission: "Frames choices, evidence, assumptions and scenarios", metric: "Decision cycle / outcome quality" },
    { name: "Strategy Signal Agent", mission: "Tracks external and internal strategic signals", metric: "Signal-to-action time" },
    { name: "Commitment Tracker", mission: "Tracks decisions, owners, dependencies and outcomes", metric: "Execution reliability" },
  ],
  hr: [
    { name: "Talent Scout", mission: "Screens against explicit criteria and prepares candidate evidence", metric: "Time-to-shortlist / fairness checks" },
    { name: "Onboarding Guide", mission: "Delivers role-specific learning and answers policy questions", metric: "Time-to-productivity" },
    { name: "Learning Coach", mission: "Creates practice, feedback and reinforcement paths", metric: "Capability gain" },
    { name: "Workforce Insight Analyst", mission: "Surfaces capacity, skills and retention signals", metric: "Actionable people insights" },
  ],
  finance: [
    { name: "Collections Coordinator", mission: "Identifies overdue invoices, drafts reminders, logs responses", metric: "DSO / cash recovered" },
    { name: "Cash Forecast Analyst", mission: "Combines receivables, payables and scenarios", metric: "Forecast accuracy" },
    { name: "Expense Assurance Agent", mission: "Flags anomalies, policy exceptions and missing evidence", metric: "Leakage / review time" },
    { name: "Management Reporting Analyst", mission: "Produces narrative variance and action prompts", metric: "Close-to-insight time" },
  ],
  operations: [
    { name: "Exception Monitor", mission: "Watches service, inventory, quality and delivery thresholds", metric: "Exception resolution time" },
    { name: "Capacity Planner", mission: "Models demand, utilization and bottlenecks", metric: "Throughput / utilization" },
    { name: "SOP Copilot", mission: "Guides staff through approved procedures", metric: "Compliance / error rate" },
    { name: "Root-Cause Analyst", mission: "Synthesizes incidents and proposes investigation paths", metric: "Repeat incident rate" },
  ],
  customerSuccess: [
    { name: "Onboarding Success Coordinator", mission: "Tracks onboarding milestones and flags at-risk accounts", metric: "Time-to-value" },
    { name: "Health Score Analyst", mission: "Combines usage, sentiment and support signals into account health", metric: "Churn prediction accuracy" },
    { name: "Renewal Coordinator", mission: "Prepares renewal evidence and drafts outreach", metric: "Renewal rate / cycle time" },
    { name: "Expansion Signal Analyst", mission: "Flags upsell and cross-sell signals from usage patterns", metric: "Expansion revenue" },
  ],
};
