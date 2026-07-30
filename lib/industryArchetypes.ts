import { IndustryArchetype } from "./types";
export type { IndustryArchetype };

export interface ArchetypeLabels {
  averageDealSize: string;
  monthlyLeads: string;
  conversionRatePct: string;
  idealCustomer: string;
  buyingCycle: string;
  dealUnit: string; // e.g. "deal", "property", "enrollment" — used in dynamic result text like "+2 {dealUnit}s/mo"
}

export const archetypeOptions: { key: IndustryArchetype; label: string }[] = [
  { key: "generic_b2b", label: "Generic B2B" },
  { key: "generic_b2c", label: "Generic B2C" },
  { key: "real_estate", label: "Real Estate" },
  { key: "coaching_education", label: "Coaching / Education" },
  { key: "healthcare_pharma", label: "Healthcare / Pharma" },
  { key: "retail_d2c", label: "Retail / D2C" },
];

const genericB2B: ArchetypeLabels = {
  averageDealSize: "Average deal size",
  monthlyLeads: "Monthly leads / inquiries",
  conversionRatePct: "Lead-to-customer conversion",
  idealCustomer: "Ideal customer",
  buyingCycle: "Buying cycle",
  dealUnit: "deal",
};

// This is the entire mechanism — same underlying fields (averageDealSize,
// monthlyLeads, conversionRatePct, idealCustomer, buyingCycle), different
// labels so the form speaks the vocabulary each industry actually uses.
// The rules engine, PDF, and financials never know an archetype exists —
// they only ever see the plain field values.
const archetypeLabels: Record<IndustryArchetype, ArchetypeLabels> = {
  generic_b2b: genericB2B,
  generic_b2c: {
    averageDealSize: "Average purchase value",
    monthlyLeads: "Monthly inquiries / site visits",
    conversionRatePct: "Visit-to-purchase rate",
    idealCustomer: "Ideal customer",
    buyingCycle: "Purchase decision time",
    dealUnit: "purchase",
  },
  real_estate: {
    averageDealSize: "Average property value",
    monthlyLeads: "Site visits / inquiries per month",
    conversionRatePct: "Inquiry-to-sale conversion rate",
    idealCustomer: "Ideal buyer profile",
    buyingCycle: "Average sales cycle",
    dealUnit: "sale",
  },
  coaching_education: {
    averageDealSize: "Average program / course price",
    monthlyLeads: "Enrollment inquiries per month",
    conversionRatePct: "Inquiry-to-enrollment rate",
    idealCustomer: "Ideal learner profile",
    buyingCycle: "Average decision time",
    dealUnit: "enrollment",
  },
  healthcare_pharma: {
    averageDealSize: "Average prescription / order value",
    monthlyLeads: "Physician engagements / inquiries per month",
    conversionRatePct: "Engagement-to-order conversion rate",
    idealCustomer: "Ideal prescriber / patient profile",
    buyingCycle: "Average adoption cycle",
    dealUnit: "order",
  },
  retail_d2c: {
    averageDealSize: "Average order value",
    monthlyLeads: "Website visits / inquiries per month",
    conversionRatePct: "Visit-to-purchase rate",
    idealCustomer: "Ideal shopper profile",
    buyingCycle: "Average purchase decision time",
    dealUnit: "order",
  },
  "": genericB2B,
};

export function getArchetypeLabels(archetype: IndustryArchetype): ArchetypeLabels {
  return archetypeLabels[archetype] ?? genericB2B;
}
