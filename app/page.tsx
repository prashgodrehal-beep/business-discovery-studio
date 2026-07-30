"use client";

import { useMemo, useState } from "react";
import StepSidebar from "@/components/wizard/StepSidebar";
import StartDiscoveryStep from "@/components/wizard/StartDiscoveryStep";
import BusinessProfileStep from "@/components/wizard/BusinessProfileStep";
import WorkflowMappingStep from "@/components/wizard/WorkflowMappingStep";
import OpportunityStep from "@/components/wizard/OpportunityStep";
import FutureWorkflowStep from "@/components/wizard/FutureWorkflowStep";
import AIWorkforceStep from "@/components/wizard/AIWorkforceStep";
import InvestmentROIStep from "@/components/wizard/InvestmentROIStep";
import BlueprintStep from "@/components/wizard/BlueprintStep";
import { BusinessProfile } from "@/lib/types";
import { generateResults } from "@/lib/rulesEngine";

const emptyProfile: BusinessProfile = {
  websiteUrl: "",
  focusGoal: "",
  focusArea: "",
  industryArchetype: "",
  company: {
    industry: "",
    businessModel: "",
    businessType: "",
    productsServices: [],
    annualRevenue: undefined,
    employeeCount: "",
    locations: 1,
    growthObjectives: [],
  },
  customer: {
    idealCustomer: "",
    averageDealSize: undefined,
    buyingCycle: "",
    customerJourney: [],
    repeatBusiness: "",
    supportExpectations: [],
  },
  departments: ["sales", "ceo", "support"],
  techStack: {},
  aiAdoption: [],
  painPoints: [],
  otherPainPoints: "",
  metrics: { headcount: {} },
  dataReadiness: { dataLocation: "", hasDashboards: "", dataQuality: "", notes: "" },
};

const stepLabels = [
  "Start Discovery",
  "Business Profile",
  "Workflow Mapping",
  "AI Opportunities",
  "Future Workflow",
  "AI Workforce Org",
  "ROI & Payback",
  "Executive Blueprint",
];

// Merges deterministically-detected tech signals (WordPress, WhatsApp link,
// Calendly, etc.) into the profile's tech stack without clobbering anything
// the person already picked, and without inventing a maturity rating —
// that's for them to judge, not something scraping can tell us.
function mergeTechStackDetected(
  current: BusinessProfile["techStack"],
  detected: Record<string, string[]>
): BusinessProfile["techStack"] {
  const next = { ...current };
  for (const [category, tools] of Object.entries(detected)) {
    const existingTools = next[category]?.tools ?? [];
    const merged = Array.from(new Set([...existingTools, ...tools]));
    next[category] = { tools: merged, maturity: next[category]?.maturity ?? "" };
  }
  return next;
}

export default function Home() {
  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile);
  const [enriching, setEnriching] = useState(false);
  const [enrichStatus, setEnrichStatus] = useState<string | null>(null);

  // Results are always computed live from whatever profile exists so far —
  // there's no separate "Generate" click. Moving forward in the wizard is
  // what reveals them.
  const results = useMemo(() => generateResults(profile), [profile]);

  async function handleEnrich(url: string) {
    setEnriching(true);
    setEnrichStatus(null);
    setProfile((p) => ({ ...p, websiteUrl: url }));

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.error || !data.result) {
        setEnrichStatus("Couldn't read this site well enough to pre-fill — no problem, just fill in the profile on the next step.");
        if (data.techStackDetected && Object.keys(data.techStackDetected).length > 0) {
          setProfile((p) => ({
            ...p,
            techStack: mergeTechStackDetected(p.techStack, data.techStackDetected),
          }));
        }
      } else {
        const r = data.result;
        const defaultedFields: string[] = data.defaultedFields ?? [];
        const techDetected: Record<string, string[]> = data.techStackDetected ?? {};

        setProfile((p) => ({
          ...p,
          company: {
            ...p.company,
            industry: r.industry ?? p.company.industry,
            businessModel: r.businessModel ?? p.company.businessModel,
            productsServices: r.productsServices ?? p.company.productsServices,
            growthObjectives: r.growthObjectives ?? p.company.growthObjectives,
          },
          customer: {
            ...p.customer,
            idealCustomer: r.idealCustomer ?? p.customer.idealCustomer,
            buyingCycle: r.buyingCycle ?? p.customer.buyingCycle,
            customerJourney: r.customerJourney ?? p.customer.customerJourney,
            supportExpectations: r.supportExpectations ?? p.customer.supportExpectations,
            repeatBusiness: r.repeatBusiness ?? p.customer.repeatBusiness,
          },
          techStack: mergeTechStackDetected(p.techStack, techDetected),
        }));

        const parts: string[] = [
          r.confidence === "low" ? "Got a rough read from the homepage (low confidence)" : "Pre-filled Company + Customer sections from the homepage",
        ];
        if (defaultedFields.length > 0) parts.push(`applied typical ${r.businessModel ?? "B2B"} defaults for ${defaultedFields.join(", ")}`);
        if (Object.keys(techDetected).length > 0) parts.push(`detected ${Object.values(techDetected).flat().join(", ")} from the site`);
        setEnrichStatus(parts.join(" — ") + " — confirm or correct on the next step.");
      }
    } catch {
      setEnrichStatus("Couldn't reach the enrichment service — fill in the profile manually on the next step.");
    } finally {
      setEnriching(false);
      setStepIndex(1);
    }
  }

  function handleManualIndustry(industry: string) {
    setProfile((p) => ({ ...p, company: { ...p.company, industry } }));
    setStepIndex(1);
  }

  function goToStep(i: number) {
    setStepIndex(i);
    window.scrollTo(0, 0);
  }

  function renderStep() {
    switch (stepIndex) {
      case 0:
        return (
          <StartDiscoveryStep
            websiteUrl={profile.websiteUrl}
            onEnrich={handleEnrich}
            enriching={enriching}
            status={enrichStatus}
            onManualIndustry={handleManualIndustry}
            focusGoal={profile.focusGoal}
            focusArea={profile.focusArea}
            onFocusGoalChange={(v) => setProfile((p) => ({ ...p, focusGoal: v }))}
            industryArchetype={profile.industryArchetype}
            onIndustryArchetypeChange={(v) => setProfile((p) => ({ ...p, industryArchetype: v }))}
            onFocusAreaChange={(v) =>
              setProfile((p) => {
                const next = { ...p, focusArea: v };
                if (v === "customer_facing" && !next.departments.includes("marketing")) {
                  next.departments = [...next.departments, "marketing"];
                }
                if (v === "internal") {
                  const internalDepts: typeof next.departments = ["hr", "finance", "operations"];
                  next.departments = Array.from(new Set([...next.departments, ...internalDepts]));
                }
                return next;
              })
            }
          />
        );
      case 1:
        return <BusinessProfileStep profile={profile} setProfile={setProfile} />;
      case 2:
        return <WorkflowMappingStep results={results} />;
      case 3:
        return <OpportunityStep profile={profile} results={results} />;
      case 4:
        return <FutureWorkflowStep results={results} />;
      case 5:
        return <AIWorkforceStep results={results} />;
      case 6:
        return <InvestmentROIStep profile={profile} results={results} />;
      case 7:
        return <BlueprintStep profile={profile} results={results} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <StepSidebar steps={stepLabels} activeIndex={stepIndex} onStepClick={goToStep} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:py-10">
        {renderStep()}

        <div className="mt-8 flex justify-between">
          <button onClick={() => goToStep(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0} className="btn-secondary">
            Back
          </button>
          {stepIndex < stepLabels.length - 1 && (
            <button onClick={() => goToStep(stepIndex + 1)} className="btn">
              {stepIndex === 0 ? "Start Business Discovery" : "Next"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
