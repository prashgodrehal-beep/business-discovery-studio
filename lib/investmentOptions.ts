import { InvestmentEstimate } from "./types";
import { investmentAssumptions } from "./assumptions";

export interface FinancingOption {
  key: string;
  label: string;
  description: string;
  upfrontDue: number;
  monthlyCost: number; // blended average for options that spread cost over time
  totalFirstYearCost: number;
}

// Three ways to structure the same underlying investment — the way a
// consulting engagement typically offers Fixed / Fixed+Variable / Retainer
// pricing. Same total cost for the first two; the third carries a premium
// because the vendor is absorbing the upfront cost and the deferral risk.
export function computeFinancingOptions(investment: InvestmentEstimate): FinancingOption[] {
  const { oneTimeInvestment, monthlyRecurring } = investment;
  const spreadMonths = investmentAssumptions.spreadMonths;
  const premium = investmentAssumptions.subscriptionPremiumMultiplier;

  const totalFirstYearBase = oneTimeInvestment + monthlyRecurring * 12;

  const payUpfront: FinancingOption = {
    key: "upfront",
    label: "Pay upfront",
    description: "One-time setup paid at kickoff — lowest total cost, fastest payback",
    upfrontDue: oneTimeInvestment,
    monthlyCost: monthlyRecurring,
    totalFirstYearCost: totalFirstYearBase,
  };

  const spread: FinancingOption = {
    key: "spread",
    label: `Spread over ${spreadMonths} months`,
    description: "Same total cost as paying upfront — smaller commitment at signing",
    upfrontDue: 0,
    monthlyCost: Math.round(totalFirstYearBase / 12),
    totalFirstYearCost: totalFirstYearBase,
  };

  const subscriptionMonthly = Math.round((monthlyRecurring + oneTimeInvestment / 12) * premium);
  const subscription: FinancingOption = {
    key: "subscription",
    label: "Subscription only",
    description: `No upfront cost at all — a ${Math.round((premium - 1) * 100)}% premium on the monthly rate instead`,
    upfrontDue: 0,
    monthlyCost: subscriptionMonthly,
    totalFirstYearCost: subscriptionMonthly * 12,
  };

  return [payUpfront, spread, subscription];
}

export interface ScalingRow {
  agentCount: number;
  oneTimeInvestment: number;
  monthlyRecurring: number;
}

// Shows the marginal cost of the next agent, transparently — not a single
// flat number that looks arbitrary in isolation.
export function investmentAtAgentCount(agentCount: number): ScalingRow {
  return {
    agentCount,
    oneTimeInvestment: investmentAssumptions.oneTimeInvestmentByAgentCount(agentCount),
    monthlyRecurring: investmentAssumptions.monthlyBaseFee + (agentCount - 1) * investmentAssumptions.monthlyPerAdditionalAgent,
  };
}

export function buildScalingTable(activeAgentCount: number): ScalingRow[] {
  const counts = new Set([1, 2, 4, 6, 8, activeAgentCount].filter((n) => n > 0));
  return Array.from(counts)
    .sort((a, b) => a - b)
    .map(investmentAtAgentCount);
}
