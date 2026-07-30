import { renderToFile } from "@react-pdf/renderer";
import { generateResults } from "./lib/rulesEngine";
import { BusinessProfile } from "./lib/types";
import BlueprintDocument from "./lib/pdf/BlueprintDocument";

const profile: BusinessProfile = {
  websiteUrl: "",
  focusGoal: "revenue",
  focusArea: "customer_facing",
  company: {
    industry: "Industrial equipment manufacturing",
    businessModel: "B2B",
    businessType: "product",
    productsServices: ["Industrial pumps", "Custom machinery"],
    annualRevenue: 100000000,
    employeeCount: "51-200",
    locations: 2,
    growthObjectives: ["scale_sales"],
  },
  customer: {
    idealCustomer: "Mid-size industrial plants",
    averageDealSize: 1500000,
    buyingCycle: "3-6 months",
    customerJourney: ["outbound", "referral"],
    repeatBusiness: "medium",
    supportExpectations: ["business_hours"],
  },
  departments: ["sales", "ceo", "support", "marketing"],
  techStack: { crm: { tools: ["Zoho"], maturity: "underused" }, erp: { tools: ["SAP"], maturity: "well_utilized" } },
  aiAdoption: [],
  painPoints: ["unqualified_leads", "manual_followup", "repetitive_questions", "too_many_approvals"],
  otherPainPoints: "High staff turnover in support during peak season.",
  metrics: {
    headcount: { sales: 8, support: 4, marketing: 2, ceo: 6 },
    marketingSpendMonthly: 200000,
    salesTeamCostMonthly: 600000,
    supportTeamCostMonthly: 200000,
    monthlyLeads: 60,
    conversionRatePct: 8,
    avgResponseTimeHours: 12,
    monthlyRevenue: 8333333,
    growthTargetPct: 20,
    currentApprovalHoursPerWeek: 10,
    repetitiveTicketsPct: 40,
  },
  dataReadiness: { dataLocation: "ERP + some Excel", hasDashboards: "partial", dataQuality: "fair", notes: "" },
};

async function main() {
  const results = generateResults(profile);
  await renderToFile(BlueprintDocument({ profile, results }), "./test-output.pdf");
  console.log("PDF rendered successfully to test-output.pdf");
}

main().catch((err) => {
  console.error("PDF render failed:");
  console.error(err);
  process.exit(1);
});
