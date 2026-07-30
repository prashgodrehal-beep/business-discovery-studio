"use client";

import { useState } from "react";
import { BusinessProfile, GeneratedResults } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { computeAgentProductivity } from "@/lib/agentProductivity";
import { MetricCard, MetricGroup, StepHeading } from "../ResultsPrimitives";

export default function InvestmentROIStep({ profile, results }: { profile: BusinessProfile; results: GeneratedResults }) {
  const f = results.financials;
  const m = profile.metrics;
  const [lean, setLean] = useState(0.5);
  const agentRows = computeAgentProductivity(profile, results.opportunities, lean);
  const totalAgentValue = agentRows.reduce((sum, r) => sum + r.monthlyValue, 0);
  const totalAgentCost = agentRows.reduce((sum, r) => sum + r.agentMonthlyCost, 0);
  const valueMultiple = totalAgentCost > 0 ? Math.round((totalAgentValue / totalAgentCost) * 10) / 10 : 0;

  const hasCurrencyFigures =
    f.revenueGrowth.additionalRevenueMonthly !== undefined ||
    f.costSavings.supportCostSavingsMonthly !== undefined ||
    f.customerExperience.currentResponseTimeHours !== undefined;

  const currentMonthlySpend = (m.marketingSpendMonthly ?? 0) + (m.salesTeamCostMonthly ?? 0) + (m.supportTeamCostMonthly ?? 0);
  const hasSpendData = m.marketingSpendMonthly !== undefined || m.salesTeamCostMonthly !== undefined || m.supportTeamCostMonthly !== undefined;

  // Show the group most relevant to the stated focus first — same numbers,
  // just reordered so the room sees what they said mattered, first.
  const groups: { key: string; el: React.ReactNode }[] = [
    {
      key: "revenue",
      el: (
        <MetricGroup title="Revenue growth">
          <MetricCard
            label="Revenue growth"
            value={`+${f.revenueGrowth.revenueGrowthPct.value}%`}
            subValue={f.revenueGrowth.additionalRevenueMonthly !== undefined ? `+${formatINR(f.revenueGrowth.additionalRevenueMonthly.value)}/mo` : undefined}
            source={f.revenueGrowth.revenueGrowthPct.source}
          />
          <MetricCard
            label="Lead leakage recovered"
            value={`-${f.revenueGrowth.leadLeakageReductionPct.value}%`}
            subValue={f.revenueGrowth.additionalDealsPerMonth !== undefined ? `+${f.revenueGrowth.additionalDealsPerMonth.value} deals/mo` : undefined}
            source={f.revenueGrowth.leadLeakageReductionPct.source}
          />
          {f.revenueGrowth.growthTargetPct !== undefined && (
            <MetricCard label="Their 6-12mo target" value={`${f.revenueGrowth.growthTargetPct}%`} subValue={`AI closes ~${f.revenueGrowth.pctOfTargetClosed}% of that gap`} />
          )}
        </MetricGroup>
      ),
    },
    {
      key: "cost",
      el: (
        <MetricGroup title="Cost savings">
          <MetricCard
            label="Support cost"
            value={`-${f.costSavings.supportCostReductionPct.value}%`}
            subValue={f.costSavings.supportCostSavingsMonthly !== undefined ? `-${formatINR(f.costSavings.supportCostSavingsMonthly.value)}/mo` : undefined}
            source={f.costSavings.supportCostReductionPct.source}
          />
        </MetricGroup>
      ),
    },
    {
      key: "efficiency",
      el: (
        <MetricGroup title="Productivity gains">
          <MetricCard label="CEO time saved" value={`${f.productivityGains.ceoHoursSavedPerWeek.value} hrs/wk`} source={f.productivityGains.ceoHoursSavedPerWeek.source} />
          <MetricCard label="Team capacity increase" value={`+${f.productivityGains.productivityBoostPct.value}%`} source={f.productivityGains.productivityBoostPct.source} />
        </MetricGroup>
      ),
    },
    {
      key: "experience",
      el: (
        <MetricGroup title="Customer experience">
          <MetricCard
            label="Response time"
            value={`-${f.customerExperience.responseTimeReductionPct.value}%`}
            subValue={
              f.customerExperience.currentResponseTimeHours !== undefined
                ? `${f.customerExperience.currentResponseTimeHours}h → ${f.customerExperience.projectedResponseTimeHours}h`
                : undefined
            }
            source={f.customerExperience.responseTimeReductionPct.source}
          />
        </MetricGroup>
      ),
    },
  ];

  const order: Record<string, string[]> = {
    revenue: ["revenue", "cost", "efficiency", "experience"],
    profit: ["revenue", "cost", "efficiency", "experience"],
    cost: ["cost", "efficiency", "revenue", "experience"],
    efficiency: ["efficiency", "cost", "revenue", "experience"],
    "": ["revenue", "cost", "efficiency", "experience"],
  };
  const orderedKeys = order[profile.focusGoal];
  const orderedGroups = orderedKeys.map((k) => groups.find((g) => g.key === k)!).filter(Boolean);

  return (
    <div>
      <StepHeading eyebrow="Step 7" title="Investment, ROI & payback" lead="Convert AI from a technology cost into business capacity and revenue upside. Every figure is tagged by how it was derived." />

      {(hasSpendData || m.monthlyRevenue) && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card-light">
            <p className="mb-3 text-xs uppercase tracking-wide text-scan-muted">Today</p>
            {hasSpendData && <MetricCard label="Current monthly spend (Marketing + Sales + Support)" value={formatINR(currentMonthlySpend)} />}
            {m.monthlyRevenue !== undefined && (
              <div className="mt-3">
                <MetricCard label="Current monthly revenue" value={formatINR(m.monthlyRevenue)} />
              </div>
            )}
          </div>
          <div className="card-light">
            <p className="mb-3 text-xs uppercase tracking-wide text-scan-teal">With AI</p>
            <MetricCard
              label="Total investment"
              value={`${formatINR(results.investment.oneTimeInvestment)} + ${formatINR(results.investment.monthlyRecurring)}/mo`}
              subValue="One-time setup + monthly recurring (includes infra)"
            />
            {f.revenueGrowth.additionalRevenueMonthly !== undefined && (
              <div className="mt-3">
                <MetricCard
                  label="Expected additional revenue"
                  value={`+${formatINR(f.revenueGrowth.additionalRevenueMonthly.value)}/mo`}
                  source={f.revenueGrowth.additionalRevenueMonthly.source}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-bold text-scan-text">Financial impact assessment</h2>
        <div className="space-y-5">{orderedGroups.map((g) => <div key={g.key}>{g.el}</div>)}</div>
        <div className="mt-5 flex flex-wrap gap-4 border-t border-scan-border pt-4 text-xs text-scan-muted">
          <span><span className="text-scan-green">● Calculated</span> — pure math on their own numbers, no assumption</span>
          <span><span className="text-scan-teal">● Estimated</span> — their real baseline × an assumption rate</span>
          <span><span className="text-scan-muted">● Directional</span> — assumption range only, no business-specific input yet</span>
        </div>
        {!hasCurrencyFigures && <p className="mt-3 text-sm text-scan-muted">Fill in Business Metrics (Step 2) to move these from directional to calculated/estimated.</p>}
      </div>

      {results.investment.activeAgentCount > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-scan-text">Investment &amp; payback</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetricCard label="One-time investment" value={formatINR(results.investment.oneTimeInvestment)} subValue="Setup & onboarding" />
            <MetricCard label="Monthly recurring" value={formatINR(results.investment.monthlyRecurring)} subValue={`Includes infra · ${results.investment.activeAgentCount} agent${results.investment.activeAgentCount === 1 ? "" : "s"} total`} />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetricCard
              label="Recommended to start"
              value={`${results.investment.recommendedStartCount} of ${results.investment.activeAgentCount} agents`}
              subValue="Rest phased in after the first wins land"
            />
            <MetricCard
              label="Expected payback"
              value={results.investment.paybackDays !== undefined ? `~${results.investment.paybackDays} days` : "—"}
              subValue={
                results.investment.paybackDays !== undefined
                  ? `(${formatINR(results.investment.oneTimeInvestment)} + ${formatINR(results.investment.monthlyRecurring)}) ÷ ${formatINR(results.investment.monthlyBenefit ?? 0)}/mo`
                  : undefined
              }
            />
          </div>
          {results.investment.paybackDays === undefined && (
            <p className="mt-4 text-sm text-scan-muted">Add monthly revenue and/or support cost in Business Metrics for a payback estimate.</p>
          )}
        </div>
      )}

      {results.profitImpact && (
        <div className="card mt-6">
          <h2 className="mb-1 text-lg font-bold text-scan-text">Profit impact</h2>
          <p className="mb-4 text-sm text-scan-muted">
            A separate, margin-adjusted view — useful for a CFO-minded room. Cost savings count in full; revenue growth only counts
            at margin rate. Not blended into the payback above — that stays on a cash basis either way.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetricCard
              label="Margin used"
              value={`${results.profitImpact.marginPctUsed}%`}
              subValue={results.profitImpact.marginSource === "estimated" ? "Your own margin" : "Typical default for this business type"}
              source={results.profitImpact.marginSource}
            />
            <MetricCard label="Monthly profit impact" value={`+${formatINR(results.profitImpact.monthlyProfitImpact)}/mo`} />
          </div>
        </div>
      )}

      {agentRows.length > 0 && (
        <div className="card mt-6">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-scan-text">Agent productivity value</h2>
            <div className="flex gap-1 rounded-md border border-scan-border p-0.5">
              {[
                { key: 0.2, label: "Conservative" },
                { key: 0.5, label: "Moderate" },
                { key: 0.8, label: "Aggressive" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setLean(opt.key)}
                  className={`focus-ring rounded px-2.5 py-1 text-xs ${lean === opt.key ? "bg-scan-tealDim text-scan-teal" : "text-scan-muted"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mb-4 text-sm text-scan-muted">
            A different lens from the Financial Impact above — not additive to it. Instead of "how much extra revenue leaks in," this
            asks "what would this same capacity cost to hire." Often the more persuasive comparison, since the funnel math above is
            deliberately conservative.
          </p>
          <div className="space-y-2">
            {agentRows.map((r) => (
              <div key={r.opportunity} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-scan-border p-3">
                <div>
                  <p className="text-sm font-semibold text-scan-text">{r.opportunity}</p>
                  <p className="text-xs text-scan-muted">≈ {r.humanEquivalentPct}% of a {r.roleLabel}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs text-scan-muted">Worth</p>
                    <p className="text-sm font-bold text-scan-green">{formatINR(r.monthlyValue)}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-scan-muted">Costs</p>
                    <p className="text-sm text-scan-text">~{formatINR(r.agentMonthlyCost)}/mo</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Total capacity value" value={`${formatINR(totalAgentValue)}/mo`} />
            <MetricCard label="Total agent cost" value={`${formatINR(totalAgentCost)}/mo`} />
            <MetricCard label="Value multiple" value={`${valueMultiple}×`} subValue="Capacity value ÷ agent cost" />
          </div>
        </div>
      )}
    </div>
  );
}
