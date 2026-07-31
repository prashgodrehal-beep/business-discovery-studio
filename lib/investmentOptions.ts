import { InvestmentEstimate } from "./types";
import { investmentAssumptions } from "./assumptions";

export interface FinancingOption {
  key: string;
  label: string;
  description: string;
  upfrontDue: number;
  monthlyCost: number; // blended average — for profit share, the average IF the target is hit
  totalFirstYearCost: number; // for profit share, an ESTIMATE contingent on hitting the target, not a guarantee
  sharePct?: number; // only set for the profit-share option
  isContingent?: boolean; // true for profit share — the cost isn't guaranteed the way the others are
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// Three ways to structure the same underlying investment — Fixed Fee / Fixed
// + Profit Share (gainshare) / Retainer, the same trio real consulting firms
// (McKinsey, PwC, BCG) use for value-based pricing. `targetAnnualProfitIncrease`
// is the client's own stated ambition (or our modeled estimate as a fallback)
// converted to ₹. `sharePctOverride` lets the room adjust the % live —
// defaults to `profitShareDefaultPct`.
export function computeFinancingOptions(
  investment: InvestmentEstimate,
  targetAnnualProfitIncrease?: number,
  sharePctOverride?: number
): FinancingOption[] {
  const { oneTimeInvestment, monthlyRecurring } = investment;
  const totalFirstYearBase = oneTimeInvestment + monthlyRecurring * 12;

  const payUpfront: FinancingOption = {
    key: "upfront",
    label: "Pay upfront",
    description: "One-time setup paid at kickoff — lowest total cost, fastest payback",
    upfrontDue: oneTimeInvestment,
    monthlyCost: monthlyRecurring,
    totalFirstYearCost: totalFirstYearBase,
  };

  let profitShare: FinancingOption | null = null;
  if (targetAnnualProfitIncrease && targetAnnualProfitIncrease > 0) {
    const fixedFee = investmentAssumptions.profitShareFixedFee;
    const sharePct = clamp(
      sharePctOverride ?? investmentAssumptions.profitShareDefaultPct,
      investmentAssumptions.profitShareMinPct,
      investmentAssumptions.profitShareMaxPct
    );
    const variableAmount = Math.round((sharePct / 100) * targetAnnualProfitIncrease);
    const clientRetainedPct = 100 - sharePct;

    profitShare = {
      key: "profit_share",
      label: "Fixed + Profit Share",
      description: `₹${fixedFee.toLocaleString("en-IN")} fixed + ${sharePct}% of the profit increase actually delivered — the client keeps ${clientRetainedPct}% of the upside, and pays more only when it's working`,
      upfrontDue: fixedFee,
      monthlyCost: Math.round(variableAmount / 12),
      totalFirstYearCost: fixedFee + variableAmount,
      sharePct,
      isContingent: true,
    };
  }

  const premium = investmentAssumptions.subscriptionPremiumMultiplier;
  const subscriptionMonthly = Math.round((monthlyRecurring + oneTimeInvestment / 12) * premium);
  const subscription: FinancingOption = {
    key: "subscription",
    label: "Subscription only",
    description: `No upfront cost at all — a ${Math.round((premium - 1) * 100)}% premium on the monthly rate instead`,
    upfrontDue: 0,
    monthlyCost: subscriptionMonthly,
    totalFirstYearCost: subscriptionMonthly * 12,
  };

  return profitShare ? [payUpfront, profitShare, subscription] : [payUpfront, subscription];
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
