"use client";

import { GeneratedResults } from "@/lib/types";
import { formatINR } from "@/lib/format";
import WorkflowDiagram from "../WorkflowDiagram";
import { MetricCard, StepHeading, impactColor } from "../ResultsPrimitives";

export default function WorkflowMappingStep({ results }: { results: GeneratedResults }) {
  const hasLeakageSignal =
    results.financials.revenueGrowth.leadLeakageReductionPct.value > 0 ||
    results.financials.productivityGains.ceoHoursSavedPerWeek.value > 0 ||
    results.financials.revenueGrowth.additionalRevenueMonthly !== undefined;

  return (
    <div>
      <StepHeading
        eyebrow="Step 3"
        title="Current workflow mapping"
        lead="This is what work actually looks like today, before AI enters the picture — the leakage becomes visible before we talk about the fix."
      />

      <div className="mb-6 card">
        <h2 className="mb-4 text-lg font-bold text-scan-text">Business pain point heatmap</h2>
        {results.heatmap.length === 0 ? (
          <p className="text-sm text-scan-muted">No pain points selected yet — head back to Business Profile to pick what's true here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-scan-muted">
                  <th className="pb-2 pr-4">Business area</th>
                  <th className="pb-2 pr-4">Observation</th>
                  <th className="pb-2">Impact</th>
                </tr>
              </thead>
              <tbody>
                {results.heatmap.map((row, i) => (
                  <tr key={i} className="border-t border-scan-border">
                    <td className="py-2 pr-4 text-scan-text">{row.area}</td>
                    <td className="py-2 pr-4 text-scan-muted">{row.observation}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${impactColor[row.impact]}`}>{row.impact}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasLeakageSignal && (
        <div className="card mb-6 border-scan-amber/40">
          <h2 className="mb-1 text-lg font-bold text-scan-text">What this is costing today</h2>
          <p className="mb-4 text-xs text-scan-muted">Before the fix — quantifying the pain points above.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {results.financials.revenueGrowth.leadLeakageReductionPct.value > 0 && (
              <MetricCard label="Leads at risk of leaking today" value={`~${results.financials.revenueGrowth.leadLeakageReductionPct.value}%`} />
            )}
            {results.financials.productivityGains.ceoHoursSavedPerWeek.value > 0 && (
              <MetricCard label="Weekly hours lost to manual work" value={`${results.financials.productivityGains.ceoHoursSavedPerWeek.value} hrs`} />
            )}
            {results.financials.revenueGrowth.additionalRevenueMonthly !== undefined && (
              <MetricCard
                label="Potential annual leakage"
                value={formatINR(results.financials.revenueGrowth.additionalRevenueMonthly.value * 12)}
              />
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="mb-1 text-lg font-bold text-scan-text">Current workflows</h2>
        <p className="mb-4 text-sm text-scan-muted">The amber ⚠ flags mark exactly which step is the bottleneck you selected above.</p>
        <div className="space-y-8">
          {results.departmentWorkflows.map((dept) => (
            <div key={dept.department}>
              <p className="mb-2 text-sm font-bold text-scan-text">{dept.label}</p>
              <WorkflowDiagram steps={dept.current} bottleneck={dept.highlightedCurrentSteps} playScan={true} />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-scan-muted">Notice how empty the AI Agents lane is today — that's the point.</p>
    </div>
  );
}
