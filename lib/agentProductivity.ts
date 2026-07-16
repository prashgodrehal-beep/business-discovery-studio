import { BusinessProfile, DepartmentKey, EstimateSource, OpportunityRow } from "./types";
import { agentHumanEquivalent, typicalFullyLoadedMonthlyCost, estimateAt, investmentAssumptions } from "./assumptions";

export interface AgentValueRow {
  opportunity: string;
  roleLabel: string;
  humanEquivalentPct: number;
  monthlyValue: number;
  valueSource: EstimateSource;
  agentMonthlyCost: number;
}

function teamCostFor(profile: BusinessProfile, department: string): number | undefined {
  if (department === "sales") return profile.metrics.salesTeamCostMonthly;
  if (department === "support") return profile.metrics.supportTeamCostMonthly;
  if (department === "marketing") return profile.metrics.marketingSpendMonthly;
  return undefined;
}

// lean: 0 = conservative (low end of the fraction range), 1 = aggressive (high end).
export function computeAgentProductivity(profile: BusinessProfile, opportunities: OpportunityRow[], lean: number): AgentValueRow[] {
  return opportunities
    .map((opp, i): AgentValueRow | null => {
      const config = agentHumanEquivalent[opp.opportunity];
      if (!config) return null;

      const fraction = estimateAt(config.fraction, lean);
      const headcount = profile.metrics.headcount[config.department as DepartmentKey];
      const teamCost = teamCostFor(profile, config.department);

      let costPerHead: number;
      let valueSource: EstimateSource;
      if (headcount && teamCost) {
        costPerHead = teamCost / headcount;
        valueSource = "calculated";
      } else {
        const range = typicalFullyLoadedMonthlyCost[config.department] ?? [30000, 50000];
        costPerHead = estimateAt(range, lean);
        valueSource = "directional";
      }

      const monthlyValue = Math.round(fraction * costPerHead);
      const agentMonthlyCost = i === 0 ? investmentAssumptions.monthlyBaseFee : investmentAssumptions.monthlyPerAdditionalAgent;

      return {
        opportunity: opp.opportunity,
        roleLabel: config.roleLabel,
        humanEquivalentPct: Math.round(fraction * 100),
        monthlyValue,
        valueSource,
        agentMonthlyCost,
      };
    })
    .filter((x): x is AgentValueRow => x !== null);
}
