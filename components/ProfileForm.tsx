"use client";

import { BusinessProfile, TechMaturity } from "@/lib/types";
import ChipGroup from "./ChipGroup";
import CurrencyField from "./CurrencyField";
import DepartmentPicker from "./DepartmentPicker";
import { painPointOptions, departmentTemplates } from "@/lib/departmentTemplates";

interface Props {
  profile: BusinessProfile;
  setProfile: (updater: (prev: BusinessProfile) => BusinessProfile) => void;
}

const employeeOptions = ["1-10", "11-50", "51-200", "200+"];
const buyingCycleOptions = ["Days", "Weeks", "1-3 months", "3-6 months", "6+ months"];
const growthOptions = [
  { key: "scale_sales", label: "Scale sales" },
  { key: "cut_costs", label: "Cut costs" },
  { key: "new_market", label: "Enter new market" },
  { key: "retention", label: "Improve retention" },
];
const journeyOptions = [
  { key: "inbound", label: "Inbound web" },
  { key: "referral", label: "Referral" },
  { key: "outbound", label: "Outbound" },
  { key: "events", label: "Events" },
  { key: "partner", label: "Partner" },
];
const supportExpOptions = [
  { key: "24x7", label: "24x7" },
  { key: "business_hours", label: "Business hours" },
  { key: "self_serve", label: "Self-serve" },
  { key: "white_glove", label: "White-glove" },
];
const repeatBusinessOptions = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High recurring" },
];
const techCategories: { key: string; label: string; options: string[] }[] = [
  { key: "crm", label: "CRM", options: ["HubSpot", "Salesforce", "Zoho", "Other"] },
  { key: "erp", label: "ERP", options: ["SAP", "Oracle", "Zoho", "Other"] },
  { key: "accounting", label: "Accounting", options: ["Tally", "QuickBooks", "Zoho Books", "Other"] },
  { key: "website", label: "Website", options: ["WordPress", "Webflow", "Custom", "Other"] },
  { key: "whatsapp", label: "WhatsApp", options: ["Business App", "API", "Other"] },
  { key: "email", label: "Email", options: ["Gmail", "Outlook", "Other"] },
  { key: "calendar", label: "Calendar", options: ["Google", "Outlook", "Other"] },
  { key: "knowledgeBase", label: "Knowledge Base", options: ["Notion", "Confluence", "Other"] },
  { key: "telephony", label: "Telephony", options: ["Cloud PBX", "Mobile", "Other"] },
];
const maturityOptions = [
  { key: "not_in_place", label: "Not in place" },
  { key: "underused", label: "In place, underused" },
  { key: "well_utilized", label: "In place, well-utilized" },
];
const aiPurposeOptionsByDept: Record<string, { key: string; label: string }[]> = {
  sales: [
    { key: "lead_scoring", label: "Lead scoring" },
    { key: "email_drafting", label: "Email drafting" },
    { key: "crm_data_entry", label: "CRM data entry" },
    { key: "call_summaries", label: "Call summaries" },
    { key: "proposal_drafting", label: "Proposal drafting" },
    { key: "other", label: "Other" },
  ],
  marketing: [
    { key: "content_creation", label: "Content creation" },
    { key: "ad_copy", label: "Ad copy" },
    { key: "social_posts", label: "Social media posts" },
    { key: "seo_research", label: "SEO research" },
    { key: "campaign_analysis", label: "Campaign analysis" },
    { key: "other", label: "Other" },
  ],
  support: [
    { key: "ticket_triage", label: "Ticket triage" },
    { key: "faq_answering", label: "FAQ answering" },
    { key: "live_chat", label: "Live chat replies" },
    { key: "sentiment_analysis", label: "Sentiment analysis" },
    { key: "other", label: "Other" },
  ],
  ceo: [
    { key: "reporting_summaries", label: "Reporting summaries" },
    { key: "meeting_notes", label: "Meeting notes" },
    { key: "strategic_research", label: "Strategic research" },
    { key: "competitive_analysis", label: "Competitive analysis" },
    { key: "other", label: "Other" },
  ],
  customerSuccess: [
    { key: "onboarding_emails", label: "Onboarding emails" },
    { key: "health_score", label: "Health-score tracking" },
    { key: "renewal_reminders", label: "Renewal reminders" },
    { key: "other", label: "Other" },
  ],
  finance: [
    { key: "invoice_processing", label: "Invoice processing" },
    { key: "expense_categorization", label: "Expense categorization" },
    { key: "forecasting", label: "Forecasting" },
    { key: "other", label: "Other" },
  ],
  hr: [
    { key: "resume_screening", label: "Resume screening" },
    { key: "interview_scheduling", label: "Interview scheduling" },
    { key: "policy_qa", label: "Policy Q&A" },
    { key: "other", label: "Other" },
  ],
  operations: [
    { key: "inventory_tracking", label: "Inventory tracking" },
    { key: "scheduling", label: "Scheduling" },
    { key: "vendor_comms", label: "Vendor communication" },
    { key: "other", label: "Other" },
  ],
};
const aiMaturityOptions = [
  { key: "adhoc", label: "Ad hoc, individual use" },
  { key: "team_habit", label: "Team habit" },
  { key: "deeply_integrated", label: "Deeply integrated into workflow" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 card">
      <h2 className="mb-4 text-lg font-bold text-scan-text">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs text-scan-muted">{label}</p>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-scan-muted">{label}</p>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm text-scan-muted">{prefix}</span>}
        <input
          type="number"
          min={0}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          placeholder="—"
          className="field-input w-32"
        />
        {suffix && <span className="text-sm text-scan-muted">{suffix}</span>}
      </div>
    </div>
  );
}

export default function ProfileForm({ profile, setProfile }: Props) {
  const jumpLinks = [
    { id: "company", label: "Company" },
    { id: "customer", label: "Customer" },
    { id: "departments", label: "Departments" },
    { id: "techstack", label: "Tech stack" },
    { id: "ai-adoption", label: "AI adoption" },
    { id: "painpoints", label: "Pain points" },
    { id: "metrics", label: "Business metrics" },
    { id: "data", label: "Data readiness" },
  ];

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-1 flex gap-2 overflow-x-auto bg-scan-bg px-1 py-2">
        {jumpLinks.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className="focus-ring whitespace-nowrap rounded-full border border-scan-border px-3 py-1 text-xs text-scan-muted hover:text-scan-text"
          >
            {l.label}
          </a>
        ))}
      </div>

      <Section id="company" title="Company profile">
        <Field label="Industry">
          <input
            value={profile.company.industry}
            onChange={(e) => setProfile((p) => ({ ...p, company: { ...p.company, industry: e.target.value } }))}
            placeholder="e.g. Industrial manufacturing"
            className="field-input"
          />
        </Field>
        <Field label="Business model">
          <ChipGroup
            multi={false}
            options={[{ key: "B2B", label: "B2B" }, { key: "B2C", label: "B2C" }, { key: "Both", label: "Both" }]}
            selected={profile.company.businessModel ? [profile.company.businessModel] : []}
            onChange={(v) => setProfile((p) => ({ ...p, company: { ...p.company, businessModel: v[0] as "B2B" | "B2C" | "Both" } }))}
          />
        </Field>
        <Field label="Business type — changes how growth potential and margin are modeled">
          <ChipGroup
            multi={false}
            options={[
              { key: "service", label: "Service / Consultancy" },
              { key: "product", label: "Product / Manufacturing" },
              { key: "hybrid", label: "Hybrid" },
            ]}
            selected={profile.company.businessType ? [profile.company.businessType] : []}
            onChange={(v) => setProfile((p) => ({ ...p, company: { ...p.company, businessType: v[0] as "service" | "product" | "hybrid" } }))}
          />
        </Field>
        <CurrencyField
          label="Annual revenue"
          value={profile.company.annualRevenue}
          onChange={(v) => setProfile((p) => ({ ...p, company: { ...p.company, annualRevenue: v } }))}
        />
        <Field label="Employee count">
          <ChipGroup
            multi={false}
            options={employeeOptions.map((r) => ({ key: r, label: r }))}
            selected={[profile.company.employeeCount]}
            onChange={(v) => setProfile((p) => ({ ...p, company: { ...p.company, employeeCount: v[0] } }))}
          />
        </Field>
        <Field label="Locations">
          <input
            type="number"
            min={1}
            value={profile.company.locations}
            onChange={(e) => setProfile((p) => ({ ...p, company: { ...p.company, locations: Number(e.target.value) } }))}
            className="field-input w-24"
          />
        </Field>
        <Field label="Growth objectives">
          <ChipGroup
            options={growthOptions}
            selected={profile.company.growthObjectives}
            onChange={(v) => setProfile((p) => ({ ...p, company: { ...p.company, growthObjectives: v } }))}
          />
        </Field>
      </Section>

      <Section id="customer" title="Customer profile">
        <Field label="Ideal customer">
          <input
            value={profile.customer.idealCustomer}
            onChange={(e) => setProfile((p) => ({ ...p, customer: { ...p.customer, idealCustomer: e.target.value } }))}
            placeholder="e.g. Mid-size industrial OEMs"
            className="field-input"
          />
        </Field>
        <CurrencyField
          label="Average deal size"
          value={profile.customer.averageDealSize}
          onChange={(v) => setProfile((p) => ({ ...p, customer: { ...p.customer, averageDealSize: v } }))}
        />
        <Field label="Buying cycle">
          <ChipGroup
            multi={false}
            options={buyingCycleOptions.map((r) => ({ key: r, label: r }))}
            selected={[profile.customer.buyingCycle]}
            onChange={(v) => setProfile((p) => ({ ...p, customer: { ...p.customer, buyingCycle: v[0] } }))}
          />
        </Field>
        <Field label="Customer journey">
          <ChipGroup
            options={journeyOptions}
            selected={profile.customer.customerJourney}
            onChange={(v) => setProfile((p) => ({ ...p, customer: { ...p.customer, customerJourney: v } }))}
          />
        </Field>
        <Field label="Repeat business">
          <ChipGroup
            multi={false}
            options={repeatBusinessOptions}
            selected={[profile.customer.repeatBusiness]}
            onChange={(v) => setProfile((p) => ({ ...p, customer: { ...p.customer, repeatBusiness: v[0] } }))}
          />
        </Field>
        <Field label="Support expectations">
          <ChipGroup
            options={supportExpOptions}
            selected={profile.customer.supportExpectations}
            onChange={(v) => setProfile((p) => ({ ...p, customer: { ...p.customer, supportExpectations: v } }))}
          />
        </Field>
      </Section>

      <Section id="departments" title="Departments in scope">
        <p className="text-xs text-scan-muted">Sales and CEO are mandatory — highest-impact workflows. Pick from what's available for the rest.</p>
        <DepartmentPicker
          selected={profile.departments}
          onChange={(v) => setProfile((p) => ({ ...p, departments: v }))}
        />
      </Section>

      <Section id="techstack" title="Current technology stack">
        <p className="text-xs text-scan-muted">For each category: which tool(s) are in use (pick none if there aren't any), and how well-utilized is it.</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {techCategories.map((cat) => (
            <div key={cat.key} className="rounded-xl border border-scan-border p-3">
              <p className="mb-2 text-sm font-semibold text-scan-text">{cat.label}</p>
              <div className="mb-3">
                <ChipGroup
                  options={cat.options.map((o) => ({ key: o, label: o }))}
                  selected={profile.techStack[cat.key]?.tools ?? []}
                  onChange={(v) =>
                    setProfile((p) => ({
                      ...p,
                      techStack: {
                        ...p.techStack,
                        [cat.key]: { tools: v, maturity: p.techStack[cat.key]?.maturity ?? "" },
                      },
                    }))
                  }
                />
              </div>
              <ChipGroup
                multi={false}
                options={maturityOptions}
                selected={profile.techStack[cat.key]?.maturity ? [profile.techStack[cat.key].maturity] : []}
                onChange={(v) =>
                  setProfile((p) => ({
                    ...p,
                    techStack: {
                      ...p.techStack,
                      [cat.key]: { tools: p.techStack[cat.key]?.tools ?? [], maturity: v[0] as TechMaturity },
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </Section>

      <Section id="ai-adoption" title="Where is AI already being used?">
        <p className="text-xs text-scan-muted">
          Pick every department already using any AI tools — then say what for and how embedded it is. Much clearer than a single
          global checkbox.
        </p>
        <ChipGroup
          options={Object.entries(departmentTemplates).map(([key, t]) => ({ key, label: t.label }))}
          selected={profile.aiAdoption.map((a) => a.department)}
          onChange={(selectedDepts) =>
            setProfile((p) => {
              const next = selectedDepts.map((deptKey) => {
                const existing = p.aiAdoption.find((a) => a.department === deptKey);
                return existing ?? { department: deptKey as BusinessProfile["departments"][number], purposes: [], maturity: "" as const };
              });
              return { ...p, aiAdoption: next };
            })
          }
        />

        {profile.aiAdoption.length > 0 && (
          <div className="space-y-3">
            {profile.aiAdoption.map((entry) => (
              <div key={entry.department} className="rounded-xl border border-scan-border p-3">
                <p className="mb-2 text-sm font-semibold text-scan-text">{departmentTemplates[entry.department].label}</p>
                <Field label="Used for">
                  <ChipGroup
                    options={aiPurposeOptionsByDept[entry.department] ?? aiPurposeOptionsByDept.operations}
                    selected={entry.purposes}
                    onChange={(v) =>
                      setProfile((p) => ({
                        ...p,
                        aiAdoption: p.aiAdoption.map((a) => (a.department === entry.department ? { ...a, purposes: v } : a)),
                      }))
                    }
                  />
                </Field>
                <Field label="How embedded">
                  <ChipGroup
                    multi={false}
                    options={aiMaturityOptions}
                    selected={entry.maturity ? [entry.maturity] : []}
                    onChange={(v) =>
                      setProfile((p) => ({
                        ...p,
                        aiAdoption: p.aiAdoption.map((a) =>
                          a.department === entry.department ? { ...a, maturity: v[0] as typeof a.maturity } : a
                        ),
                      }))
                    }
                  />
                </Field>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section id="painpoints" title="Top business pain points">
        <p className="text-xs text-scan-muted">Pick what's actually true for this business — this drives everything after Generate.</p>
        <ChipGroup
          options={painPointOptions.map((p) => ({ key: p.key, label: p.label }))}
          selected={profile.painPoints}
          onChange={(v) => setProfile((p) => ({ ...p, painPoints: v as BusinessProfile["painPoints"] }))}
        />
        <Field label="Anything else that doesn't fit the list above?">
          <textarea
            value={profile.otherPainPoints}
            onChange={(e) => setProfile((p) => ({ ...p, otherPainPoints: e.target.value }))}
            placeholder="e.g. High staff turnover in support, or seasonal demand spikes we can't staff for"
            rows={2}
            className="field-input"
          />
        </Field>
        <p className="text-xs text-scan-muted">
          Doesn&apos;t feed the Matrix or Financial Impact numbers — it&apos;s context for you and for the Executive Blueprint narrative.
        </p>
      </Section>

      <Section id="metrics" title="Business metrics">
        <p className="text-xs text-scan-muted">
          Optional — leave blank if you don&apos;t have these handy. Anything filled in sharpens the Financial Impact numbers from
          percentages into real ₹ figures.
        </p>

        {profile.departments.some((d) => departmentTemplates[d].hasTemplate) && (
          <Field label="Headcount by team">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {profile.departments
                .filter((d) => departmentTemplates[d].hasTemplate)
                .map((d) => (
                  <NumberField
                    key={d}
                    label={departmentTemplates[d].label}
                    value={profile.metrics.headcount[d]}
                    onChange={(v) =>
                      setProfile((p) => ({ ...p, metrics: { ...p.metrics, headcount: { ...p.metrics.headcount, [d]: v } } }))
                    }
                    suffix="people"
                  />
                ))}
            </div>
          </Field>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CurrencyField
            label="Marketing spend / month"
            value={profile.metrics.marketingSpendMonthly}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, marketingSpendMonthly: v } }))}
          />
          <CurrencyField
            label="Sales team cost / month"
            value={profile.metrics.salesTeamCostMonthly}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, salesTeamCostMonthly: v } }))}
          />
          <CurrencyField
            label="Support team cost / month"
            value={profile.metrics.supportTeamCostMonthly}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, supportTeamCostMonthly: v } }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            label="Monthly leads / inquiries"
            value={profile.metrics.monthlyLeads}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, monthlyLeads: v } }))}
            suffix="/ month"
          />
          <NumberField
            label="Lead-to-customer conversion"
            value={profile.metrics.conversionRatePct}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, conversionRatePct: v } }))}
            suffix="%"
          />
          <NumberField
            label="Average response time"
            value={profile.metrics.avgResponseTimeHours}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, avgResponseTimeHours: v } }))}
            suffix="hours"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Current approval hours (CEO)"
            value={profile.metrics.currentApprovalHoursPerWeek}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, currentApprovalHoursPerWeek: v } }))}
            suffix="hrs / week"
          />
          <NumberField
            label="% of support tickets that are repetitive"
            value={profile.metrics.repetitiveTicketsPct}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, repetitiveTicketsPct: v } }))}
            suffix="%"
          />
        </div>
        <p className="text-xs text-scan-muted">
          These two turn CEO time-saved and support cost-saved from a directional estimate into a calculation grounded in this
          business&apos;s own numbers.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CurrencyField
            label="Monthly revenue"
            value={profile.metrics.monthlyRevenue}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, monthlyRevenue: v } }))}
          />
          <NumberField
            label="Growth target, next 6-12 months"
            value={profile.metrics.growthTargetPct}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, growthTargetPct: v } }))}
            suffix="%"
          />
          <NumberField
            label="Gross margin (if known)"
            value={profile.metrics.grossMarginPct}
            onChange={(v) => setProfile((p) => ({ ...p, metrics: { ...p.metrics, grossMarginPct: v } }))}
            suffix="%"
          />
        </div>
        <p className="text-xs text-scan-muted">
          Leave margin blank and a typical default for the business type above gets used instead — clearly labeled as a default, not
          a calculation, wherever it shows up.
        </p>
      </Section>

      <Section id="data" title="Data & systems readiness">
        <p className="text-xs text-scan-muted">
          Optional — open questions worth asking live. These don&apos;t feed the numbers, but they tell you (and eventually the
          narrative summary) how ready the business actually is to plug AI into its data.
        </p>
        <Field label="Where does the business's data actually live today?">
          <input
            value={profile.dataReadiness.dataLocation}
            onChange={(e) => setProfile((p) => ({ ...p, dataReadiness: { ...p.dataReadiness, dataLocation: e.target.value } }))}
            placeholder="e.g. Mostly Excel sheets, some in Zoho CRM"
            className="field-input"
          />
        </Field>
        <Field label="Do they have existing dashboards or reporting?">
          <ChipGroup
            multi={false}
            options={[
              { key: "yes", label: "Yes" },
              { key: "partial", label: "Partial" },
              { key: "no", label: "No" },
            ]}
            selected={profile.dataReadiness.hasDashboards ? [profile.dataReadiness.hasDashboards] : []}
            onChange={(v) =>
              setProfile((p) => ({ ...p, dataReadiness: { ...p.dataReadiness, hasDashboards: v[0] as "yes" | "partial" | "no" } }))
            }
          />
        </Field>
        <Field label="How would you rate their data quality / consistency?">
          <ChipGroup
            multi={false}
            options={[
              { key: "poor", label: "Poor" },
              { key: "fair", label: "Fair" },
              { key: "good", label: "Good" },
              { key: "excellent", label: "Excellent" },
            ]}
            selected={profile.dataReadiness.dataQuality ? [profile.dataReadiness.dataQuality] : []}
            onChange={(v) =>
              setProfile((p) => ({
                ...p,
                dataReadiness: { ...p.dataReadiness, dataQuality: v[0] as "poor" | "fair" | "good" | "excellent" },
              }))
            }
          />
        </Field>
        <Field label="Anything else worth noting about their data or systems?">
          <textarea
            value={profile.dataReadiness.notes}
            onChange={(e) => setProfile((p) => ({ ...p, dataReadiness: { ...p.dataReadiness, notes: e.target.value } }))}
            placeholder="e.g. Sales data is clean, but support tickets live in email only"
            rows={3}
            className="field-input"
          />
        </Field>
      </Section>
    </div>
  );
}
