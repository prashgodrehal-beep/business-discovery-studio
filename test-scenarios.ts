import { generateResults } from "./lib/rulesEngine";
import { BusinessProfile } from "./lib/types";

function baseProfile(): BusinessProfile {
  return {
    websiteUrl: "",
    focusGoal: "",
    focusArea: "",
    industryArchetype: "",
    company: { industry: "", businessModel: "B2B", businessType: "", productsServices: [], annualRevenue: undefined, employeeCount: "", locations: 1, growthObjectives: [] },
    customer: { idealCustomer: "", averageDealSize: undefined, buyingCycle: "", customerJourney: [], repeatBusiness: "", supportExpectations: [] },
    departments: ["sales", "ceo", "support"],
    techStack: {},
    aiAdoption: [],
    painPoints: [],
    otherPainPoints: "",
    metrics: { headcount: {} },
    dataReadiness: { dataLocation: "", hasDashboards: "", dataQuality: "", notes: "" },
  };
}

const scenarios: { name: string; profile: BusinessProfile }[] = [
  {
    name: "Manufacturing — ₹10Cr/yr, 50-100 people",
    profile: {
      ...baseProfile(),
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
      painPoints: ["unqualified_leads", "manual_followup", "repetitive_questions", "too_many_approvals"],
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
    },
  },
  {
    name: "Engineering consultancy — ₹15Cr/yr, 75 people",
    profile: {
      ...baseProfile(),
      company: {
        industry: "Engineering consultancy",
        businessModel: "B2B",
        businessType: "service",
        productsServices: ["Structural design", "Project consulting"],
        annualRevenue: 150000000,
        employeeCount: "51-200",
        locations: 3,
        growthObjectives: ["scale_sales", "new_market"],
      },
      customer: {
        idealCustomer: "Mid-size construction & infra firms",
        averageDealSize: 2000000,
        buyingCycle: "1-3 months",
        customerJourney: ["referral", "outbound"],
        repeatBusiness: "high",
        supportExpectations: ["business_hours"],
      },
      departments: ["sales", "ceo", "support", "marketing"],
      techStack: { crm: { tools: ["HubSpot"], maturity: "well_utilized" } },
      aiAdoption: [{ department: "marketing", purposes: ["content_creation"], maturity: "adhoc" }],
      painPoints: ["unqualified_leads", "manual_followup", "poor_campaign_roi", "too_many_approvals"],
      metrics: {
        headcount: { sales: 6, support: 3, marketing: 3, ceo: 5 },
        marketingSpendMonthly: 300000,
        salesTeamCostMonthly: 800000,
        supportTeamCostMonthly: 200000,
        monthlyLeads: 40,
        conversionRatePct: 15,
        avgResponseTimeHours: 6,
        monthlyRevenue: 12500000,
        growthTargetPct: 30,
        currentApprovalHoursPerWeek: 8,
      },
      dataReadiness: { dataLocation: "HubSpot CRM", hasDashboards: "yes", dataQuality: "good", notes: "" },
    },
  },
  {
    name: "Generic pharma — ₹200Cr/yr, 500 sales + 7-8 marketing, sales-driven",
    profile: {
      ...baseProfile(),
      company: {
        industry: "Generic pharmaceuticals",
        businessModel: "B2B",
        businessType: "product",
        productsServices: ["Generic drug manufacturing", "Distribution"],
        annualRevenue: 2000000000,
        employeeCount: "200+",
        locations: 10,
        growthObjectives: ["scale_sales"],
      },
      customer: {
        idealCustomer: "Hospitals, pharmacies, physicians",
        averageDealSize: undefined, // deliberately blank — testing whether a deal-based model even fits this business
        buyingCycle: "Weeks",
        customerJourney: ["outbound", "referral"],
        repeatBusiness: "high",
        supportExpectations: ["business_hours"],
      },
      departments: ["sales", "ceo", "support", "marketing"],
      techStack: { crm: { tools: ["Salesforce"], maturity: "well_utilized" } },
      aiAdoption: [{ department: "sales", purposes: ["crm_data_entry"], maturity: "team_habit" }],
      painPoints: ["unqualified_leads", "manual_followup", "too_many_approvals", "poor_campaign_roi"],
      metrics: {
        headcount: { sales: 500, marketing: 8, ceo: 10 },
        marketingSpendMonthly: 5000000,
        salesTeamCostMonthly: 30000000,
        supportTeamCostMonthly: 1500000,
        monthlyLeads: 2000,
        conversionRatePct: undefined, // deliberately blank — "conversion" doesn't map cleanly to prescription-driven revenue
        avgResponseTimeHours: 24,
        monthlyRevenue: 166700000,
        growthTargetPct: 15,
        currentApprovalHoursPerWeek: 15,
      },
      dataReadiness: { dataLocation: "Salesforce + regional Excel trackers", hasDashboards: "partial", dataQuality: "fair", notes: "" },
    },
  },
  {
    name: "Internal-focus test — HR/Finance/Operations, all 8 pain points, all 7 built departments",
    profile: {
      ...baseProfile(),
      focusArea: "internal",
      company: {
        industry: "Mid-size logistics company",
        businessModel: "B2B",
        businessType: "hybrid",
        productsServices: ["Freight brokerage", "Warehousing"],
        annualRevenue: 500000000,
        employeeCount: "200+",
        locations: 5,
        growthObjectives: ["cut_costs"],
      },
      customer: {
        idealCustomer: "Mid-size retailers and manufacturers",
        averageDealSize: 500000,
        buyingCycle: "1-3 months",
        customerJourney: ["referral"],
        repeatBusiness: "high",
        supportExpectations: ["business_hours"],
      },
      departments: ["sales", "ceo", "support", "marketing", "hr", "finance", "operations"],
      techStack: { crm: { tools: ["Zoho"], maturity: "underused" } },
      painPoints: [
        "unqualified_leads",
        "manual_followup",
        "repetitive_questions",
        "too_many_approvals",
        "manual_onboarding",
        "poor_campaign_roi",
        "cash_flow_delays",
        "operational_bottlenecks",
      ],
      metrics: {
        headcount: { sales: 10, support: 6, marketing: 3, ceo: 8, hr: 3, finance: 4, operations: 12 },
        marketingSpendMonthly: 150000,
        salesTeamCostMonthly: 700000,
        supportTeamCostMonthly: 300000,
        monthlyLeads: 50,
        conversionRatePct: 10,
        avgResponseTimeHours: 10,
        monthlyRevenue: 41700000,
        growthTargetPct: 25,
        currentApprovalHoursPerWeek: 12,
        repetitiveTicketsPct: 35,
      },
      dataReadiness: { dataLocation: "Mostly Excel across regions", hasDashboards: "no", dataQuality: "poor", notes: "" },
    },
  },
];

for (const { name, profile } of scenarios) {
  console.log("\n" + "=".repeat(80));
  console.log(name);
  console.log("=".repeat(80));
  const r = generateResults(profile);

  console.log("\n-- Maturity --");
  console.log(r.maturity);

  console.log("\n-- Readiness score --", r.readinessScore);

  console.log("\n-- Opportunities --");
  r.opportunities.forEach((o) => console.log(` - ${o.opportunity} (ROI ${o.roi}, ${o.priorityStars}★)${o.foundationNeeded ? "  ⚠ " + o.foundationNeeded.note : ""}`));

  console.log("\n-- Financials --");
  console.log("Revenue growth:", r.financials.revenueGrowth);
  console.log("Productivity gains:", r.financials.productivityGains);
  console.log("Cost savings:", r.financials.costSavings);
  console.log("Customer experience:", r.financials.customerExperience);

  console.log("\n-- Profit Impact --");
  console.log(r.profitImpact);

  console.log("\n-- Investment --");
  console.log(r.investment);
}
