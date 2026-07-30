import { DepartmentKey, DepartmentTemplate, WorkflowStep } from "./types";

// This file is the entire "workflow library" — Deliverables 2 (Current Workflow),
// 5 (Future Workflow), and 6 (Human + AI Collaboration Model) all read from here.
// No AI call needed for any of it. Each step carries an `owner` so the UI can
// show who actually does the work: human, ai, collaborative, or system (a tool
// or external touchpoint — never a "role"). AI steps are named after the JOB
// THEY PERFORM (Lead Intelligence Analyst, Collections Coordinator), not a
// branded persona — matching lib/aiRoleCatalog.ts, which is the full
// possibility-space catalog these workflows draw their named roles from.
// To add a new department: author currentWorkflow + futureWorkflow + painPointTriggers,
// then flip hasTemplate to true. The picker in ProfileForm reacts automatically.

const s = (label: string): WorkflowStep => ({ label, owner: "system" });
const h = (label: string): WorkflowStep => ({ label, owner: "human" });
const a = (label: string): WorkflowStep => ({ label, owner: "ai" });
const c = (label: string): WorkflowStep => ({ label, owner: "collaborative" });

export const departmentTemplates: Record<DepartmentKey, DepartmentTemplate> = {
  sales: {
    label: "Sales",
    hasTemplate: true,
    mandatory: true,
    currentWorkflow: [
      s("Website"),
      s("Lead Form"),
      h("Receptionist"),
      h("Sales Coordinator"),
      h("Salesperson"),
      h("Follow-up"),
      h("Proposal"),
      h("Negotiation"),
      s("Customer"),
    ],
    futureWorkflow: [
      s("Website"),
      a("Lead Intelligence Analyst"),
      a("Calendar Coordinator"),
      s("CRM"),
      c("Salesperson + Deal Coach"),
      a("Follow-up Coordinator"),
      a("Account Researcher"),
      h("Proposal Review & Send"),
      h("Negotiation"),
      s("Customer"),
    ],
    painPointTriggers: {
      unqualified_leads: "Lead Intelligence Analyst",
      manual_followup: "Follow-up Coordinator",
    },
    currentPainSteps: {
      unqualified_leads: "Lead Form",
      manual_followup: "Follow-up",
    },
  },
  ceo: {
    label: "CEO",
    hasTemplate: true,
    mandatory: true,
    currentWorkflow: [
      h("Reports"),
      h("Meetings"),
      h("Approvals"),
      h("Decisions"),
      h("Escalations"),
      h("Emails"),
      h("Business Review"),
    ],
    futureWorkflow: [
      s("Reports"),
      a("Executive Briefing Agent"),
      a("Supervisor Agent (CEO Command Center)"),
      a("Decision Analyst"),
      a("Strategy Signal Agent"),
      c("Approvals (Exception Only)"),
      h("Decisions"),
      a("Commitment Tracker"),
      c("Escalations (AI-Filtered)"),
      c("Business Review"),
    ],
    painPointTriggers: {
      too_many_approvals: "Approvals (Exception Only)",
    },
    currentPainSteps: {
      too_many_approvals: "Approvals",
    },
  },
  support: {
    label: "Customer Support",
    hasTemplate: true,
    mandatory: false,
    currentWorkflow: [s("Customer"), s("Call"), h("Reception"), h("Support Executive"), h("Manager"), h("Resolution")],
    futureWorkflow: [
      s("Customer"),
      a("Triage Coordinator"),
      a("Knowledge Resolver"),
      a("Customer Risk Monitor"),
      c("Issue Resolution"),
      c("Escalation (Only When Needed)"),
      a("Quality Coach"),
      h("Human Expert"),
    ],
    painPointTriggers: {
      repetitive_questions: "Knowledge Resolver",
    },
    currentPainSteps: {
      repetitive_questions: "Support Executive",
    },
  },
  marketing: {
    label: "Marketing",
    hasTemplate: true,
    mandatory: false,
    currentWorkflow: [
      h("Campaign Planning"),
      h("Content Creation"),
      h("Ad Spend Management"),
      s("Lead Capture Form"),
      h("Lead Handoff to Sales"),
      h("Performance Reporting"),
    ],
    futureWorkflow: [
      c("Campaign Planning + Market Signal Analyst"),
      a("Content Repurposing Producer"),
      a("Campaign Optimizer"),
      s("Lead Capture Form"),
      a("Voice-of-Customer Synthesizer"),
      a("Lead Routing Coordinator"),
    ],
    painPointTriggers: {
      poor_campaign_roi: "Campaign Optimizer",
    },
    currentPainSteps: {
      poor_campaign_roi: "Ad Spend Management",
    },
  },
  hr: {
    label: "HR",
    hasTemplate: true,
    mandatory: false,
    currentWorkflow: [
      h("Job Posting"),
      h("Resume Screening"),
      h("Interview Scheduling"),
      h("Onboarding"),
      h("Policy Q&A"),
      h("Exit Interviews"),
    ],
    futureWorkflow: [
      s("Job Posting"),
      a("Talent Scout"),
      h("Hiring Manager Review"),
      a("Onboarding Guide"),
      a("Learning Coach"),
      a("Workforce Insight Analyst"),
    ],
    painPointTriggers: {
      manual_onboarding: "Onboarding Guide",
    },
    currentPainSteps: {
      manual_onboarding: "Onboarding",
    },
  },
  finance: {
    label: "Finance",
    hasTemplate: true,
    mandatory: false,
    currentWorkflow: [
      h("Invoice Tracking"),
      h("Collections Calls"),
      h("Expense Review"),
      h("Cash Forecasting"),
      h("Management Reporting"),
    ],
    futureWorkflow: [
      s("Invoice Tracking"),
      a("Collections Coordinator"),
      a("Expense Assurance Agent"),
      a("Cash Forecast Analyst"),
      h("CFO Review"),
      a("Management Reporting Analyst"),
    ],
    painPointTriggers: {
      cash_flow_delays: "Collections Coordinator",
    },
    currentPainSteps: {
      cash_flow_delays: "Collections Calls",
    },
  },
  operations: {
    label: "Operations",
    hasTemplate: true,
    mandatory: false,
    currentWorkflow: [
      h("Scheduling"),
      h("Inventory Tracking"),
      h("Vendor Coordination"),
      h("Quality Checks"),
      h("Incident Reporting"),
    ],
    futureWorkflow: [
      s("Scheduling"),
      a("Capacity Planner"),
      a("Exception Monitor"),
      a("SOP Copilot"),
      h("Operations Manager Review"),
      a("Root-Cause Analyst"),
    ],
    painPointTriggers: {
      operational_bottlenecks: "Exception Monitor",
    },
    currentPainSteps: {
      operational_bottlenecks: "Incident Reporting",
    },
  },
  customerSuccess: { label: "Customer Success", hasTemplate: false, mandatory: false, currentWorkflow: [], futureWorkflow: [], painPointTriggers: {}, currentPainSteps: {} },
};

export const painPointOptions: { key: string; label: string; area: string; impact: "High" | "Medium" | "Low" }[] = [
  { key: "unqualified_leads", label: "Visitors not qualified before reaching sales", area: "Website", impact: "High" },
  { key: "manual_followup", label: "Manual, inconsistent follow-up", area: "Sales", impact: "High" },
  { key: "repetitive_questions", label: "Repetitive customer questions", area: "Support", impact: "Medium" },
  { key: "too_many_approvals", label: "Too many approvals routed to the CEO", area: "CEO", impact: "High" },
  { key: "manual_onboarding", label: "Manual employee onboarding", area: "HR", impact: "Medium" },
  { key: "poor_campaign_roi", label: "Marketing spend not tied to measurable ROI", area: "Marketing", impact: "Medium" },
  { key: "cash_flow_delays", label: "Slow collections and limited cash flow visibility", area: "Finance", impact: "High" },
  { key: "operational_bottlenecks", label: "Recurring operational exceptions going unnoticed", area: "Operations", impact: "Medium" },
];
