import { DepartmentKey, DepartmentTemplate, WorkflowStep } from "./types";

// This file is the entire "workflow library" — Deliverables 2 (Current Workflow),
// 5 (Future Workflow), and 6 (Human + AI Collaboration Model) all read from here.
// No AI call needed for any of it. Each step carries an `owner` so the UI can
// show who actually does the work: human, ai, collaborative, or system (a tool
// or external touchpoint — never a "role"). AI steps are named as distinct
// "___ Agent" specialists (Lead Agent, Data Analyst Agent, etc.) so the
// AI Workforce Org view (Deliverable 7) can pull a real specialist roster
// straight out of these workflows, rather than a separate hardcoded list.
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
      a("Lead Agent (Sreeja AI)"),
      a("Calendar Booking"),
      s("CRM"),
      a("Data Analyst Agent"),
      h("Salesperson"),
      a("Follow-up Agent (Shreenika AI)"),
      a("Proposal Agent (Drafts Proposal)"),
      h("Proposal Review & Send"),
      h("Negotiation"),
      s("Customer"),
    ],
    painPointTriggers: {
      unqualified_leads: "Lead Agent (Sreeja AI)",
      manual_followup: "Follow-up Agent (Shreenika AI)",
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
      a("Supervisor Agent (CEO Command Center)"),
      a("Data Analyst Agent"),
      a("Market Research Agent"),
      c("Approvals (Exception Only)"),
      h("Decisions"),
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
      a("Support Agent (Shreenika AI)"),
      a("Knowledge Agent"),
      c("Issue Resolution"),
      c("Escalation (Only When Needed)"),
      h("Human Expert"),
    ],
    painPointTriggers: {
      repetitive_questions: "Support Agent (Shreenika AI)",
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
      c("Campaign Planning + Market Research Agent"),
      a("Content Agent"),
      a("Ad Spend Agent"),
      s("Lead Capture Form"),
      a("Lead Scoring Agent"),
      a("Auto-Routed Handoff to Sales"),
      a("Analytics Agent"),
    ],
    painPointTriggers: {
      poor_campaign_roi: "Ad Spend Agent",
    },
    currentPainSteps: {
      poor_campaign_roi: "Ad Spend Management",
    },
  },
  customerSuccess: { label: "Customer Success", hasTemplate: false, mandatory: false, currentWorkflow: [], futureWorkflow: [], painPointTriggers: {}, currentPainSteps: {} },
  finance: { label: "Finance", hasTemplate: false, mandatory: false, currentWorkflow: [], futureWorkflow: [], painPointTriggers: {}, currentPainSteps: {} },
  hr: { label: "HR", hasTemplate: false, mandatory: false, currentWorkflow: [], futureWorkflow: [], painPointTriggers: {}, currentPainSteps: {} },
  operations: { label: "Operations", hasTemplate: false, mandatory: false, currentWorkflow: [], futureWorkflow: [], painPointTriggers: {}, currentPainSteps: {} },
};

export const painPointOptions: { key: string; label: string; area: string; impact: "High" | "Medium" | "Low" }[] = [
  { key: "unqualified_leads", label: "Visitors not qualified before reaching sales", area: "Website", impact: "High" },
  { key: "manual_followup", label: "Manual, inconsistent follow-up", area: "Sales", impact: "High" },
  { key: "repetitive_questions", label: "Repetitive customer questions", area: "Support", impact: "Medium" },
  { key: "too_many_approvals", label: "Too many approvals routed to the CEO", area: "CEO", impact: "High" },
  { key: "manual_onboarding", label: "Manual employee onboarding", area: "HR", impact: "Medium" },
  { key: "poor_campaign_roi", label: "Marketing spend not tied to measurable ROI", area: "Marketing", impact: "Medium" },
];
