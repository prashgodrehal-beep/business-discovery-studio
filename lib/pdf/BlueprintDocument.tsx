import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { BusinessProfile, GeneratedResults, SourcedNumber, EstimateSource } from "../types";
import { formatINR } from "../format";
import { departmentTemplates } from "../departmentTemplates";
import { buildWorkforceOrg } from "../workforce";
import { computeFinancingOptions } from "../investmentOptions";
import { getArchetypeLabels } from "../industryArchetypes";

// Light, print-friendly theme — the app's dark navy/purple works on screen
// but not on paper. Same brand accent hues, darkened for contrast on white.
const color = {
  text: "#161b2e",
  muted: "#6b7280",
  border: "#d8dce6",
  bg: "#f7f8fb",
  purple: "#6d3fd6",
  purpleBg: "#f1ecfc",
  teal: "#067a8a",
  tealBg: "#e6f6f8",
  green: "#15803d",
  greenBg: "#e9f7ef",
  amber: "#b45309",
  amberBg: "#fdf1e2",
};

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: color.text },
  coverPage: { padding: 56, fontFamily: "Helvetica", color: color.text, justifyContent: "space-between" },
  eyebrow: { fontSize: 9, color: color.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  h1: { fontSize: 26, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  h2: { fontSize: 15, fontFamily: "Helvetica-Bold", marginBottom: 10, marginTop: 18 },
  h3: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  p: { fontSize: 10, lineHeight: 1.5, color: color.text, marginBottom: 6 },
  muted: { fontSize: 9, color: color.muted },
  row: { flexDirection: "row" },
  card: { border: 1, borderColor: color.border, borderRadius: 6, padding: 10, marginBottom: 8 },
  cardLight: { backgroundColor: color.bg, borderRadius: 6, padding: 10, marginBottom: 8 },
  badge: { fontSize: 7, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 8, textTransform: "uppercase" },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  metricBox: { width: "31%", backgroundColor: color.bg, borderRadius: 6, padding: 8, marginBottom: 8 },
  metricLabel: { fontSize: 8, color: color.muted, marginBottom: 3 },
  metricValue: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  metricSub: { fontSize: 8, color: color.muted, marginTop: 2 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: color.muted, borderTop: 1, borderTopColor: color.border, paddingTop: 6 },
  workflowStep: { border: 1, borderColor: color.border, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 6, marginRight: 4, marginBottom: 4, fontSize: 8 },
  th: { fontSize: 8, color: color.muted, textTransform: "uppercase" },
  td: { fontSize: 9 },
});

const sourceBadge: Record<EstimateSource, { bg: string; fg: string; label: string }> = {
  calculated: { bg: color.greenBg, fg: color.green, label: "Calculated" },
  estimated: { bg: color.tealBg, fg: color.teal, label: "Estimated" },
  directional: { bg: color.bg, fg: color.muted, label: "Directional" },
};

function Badge({ source }: { source: EstimateSource }) {
  const b = sourceBadge[source];
  return <Text style={[s.badge, { backgroundColor: b.bg, color: b.fg }]}>{b.label}</Text>;
}

function MetricBox({ label, value, subValue, source }: { label: string; value: string; subValue?: string; source?: EstimateSource }) {
  return (
    <View style={s.metricBox}>
      <View style={[s.row, { justifyContent: "space-between", alignItems: "center" }]}>
        <Text style={s.metricLabel}>{label}</Text>
        {source && <Badge source={source} />}
      </View>
      <Text style={s.metricValue}>{value}</Text>
      {subValue && <Text style={s.metricSub}>{subValue}</Text>}
    </View>
  );
}

function SectionHeading({ num, title }: { num: string; title: string }) {
  return (
    <View style={{ marginTop: 20, marginBottom: 10, borderBottom: 1.5, borderBottomColor: color.purple, paddingBottom: 6 }}>
      <Text style={s.eyebrow}>{num}</Text>
      <Text style={s.h2}>{title}</Text>
    </View>
  );
}

function Footer({ companyLabel }: { companyLabel: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>AI Business Discovery Studio™ — {companyLabel}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

const ownerLabel: Record<string, string> = { human: "Human", ai: "AI", collaborative: "Human + AI", system: "System" };
const ownerColor: Record<string, string> = { human: "#2563a8", ai: color.teal, collaborative: color.purple, system: color.muted };

function WorkflowRow({ steps, highlighted = [] }: { steps: { label: string; owner: string }[]; highlighted?: string[] }) {
  return (
    <View style={[s.row, { flexWrap: "wrap" }]}>
      {steps.map((step, i) => (
        <View key={i} style={[s.workflowStep, { borderColor: highlighted.includes(step.label) ? color.green : color.border }]}>
          <Text>{step.label}</Text>
          <Text style={{ color: ownerColor[step.owner], fontSize: 7, marginTop: 1 }}>{ownerLabel[step.owner]}</Text>
        </View>
      ))}
    </View>
  );
}

function pct(n: SourcedNumber, sign = "+") {
  return `${sign}${n.value}%`;
}

export default function BlueprintDocument({ profile, results }: { profile: BusinessProfile; results: GeneratedResults }) {
  const industryLabel = profile.company.industry || "This business";
  const companyLabel = profile.company.industry || "Confidential";
  const f = results.financials;
  const deploymentOrder = [...results.opportunities].sort((a, b) => b.priorityStars - a.priorityStars);
  const org = buildWorkforceOrg(results.departmentWorkflows, results.maturity);
  const financingOptions = results.investment.activeAgentCount > 0 ? computeFinancingOptions(results.investment) : [];
  const archetypeLabels = getArchetypeLabels(profile.industryArchetype);
  const today = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  const verdict =
    results.readinessScore >= 75 ? "high customer-facing AI potential" : results.readinessScore >= 55 ? "solid, well-defined AI opportunity" : "early-stage opportunity — foundational fixes first";

  return (
    <Document title={`AI Transformation Blueprint — ${industryLabel}`}>
      {/* Cover page */}
      <Page size="A4" style={s.coverPage}>
        <View>
          <Text style={[s.eyebrow, { fontSize: 11 }]}>AI Business Discovery Studio™</Text>
          <Text style={{ fontSize: 30, fontFamily: "Helvetica-Bold", marginTop: 100, marginBottom: 14, lineHeight: 1.3 }}>
            Executive AI Transformation Blueprint
          </Text>
          <Text style={{ fontSize: 13, color: color.muted, marginBottom: 4 }}>{industryLabel}</Text>
          <Text style={{ fontSize: 10, color: color.muted }}>{today}</Text>
        </View>
        <View>
          <View style={[s.row, { gap: 10 }]}>
            <View style={{ flex: 1, backgroundColor: color.purpleBg, borderRadius: 8, padding: 14 }}>
              <Text style={{ fontSize: 8, color: color.purple, textTransform: "uppercase" }}>AI Readiness</Text>
              <Text style={{ fontSize: 24, fontFamily: "Helvetica-Bold", color: color.purple }}>{results.readinessScore} / 100</Text>
            </View>
            <View style={{ flex: 2, backgroundColor: color.bg, borderRadius: 8, padding: 14 }}>
              <Text style={{ fontSize: 9, color: color.muted }}>{verdict}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 8, color: color.muted, marginTop: 20 }}>
            Prepared by GrowthAspire — this document is confidential and prepared specifically for the recipient.
          </Text>
        </View>
      </Page>

      {/* Executive Summary + Business Profile */}
      <Page size="A4" style={s.page}>
        <SectionHeading num="01" title="Executive Summary" />
        <Text style={s.p}>
          {industryLabel} shows {verdict}. The highest-ROI starting points are{" "}
          {deploymentOrder.slice(0, 2).map((o) => o.opportunity).join(" and ") || "not yet defined"}, out of{" "}
          {results.investment.activeAgentCount} recommended agents in total, {results.investment.recommendedStartCount} of which
          this blueprint recommends deploying first.
        </Text>
        <View style={s.metricGrid}>
          <MetricBox label="AI Readiness" value={`${results.readinessScore}/100`} />
          <MetricBox label="Maturity level" value={`${results.maturity.currentLevel} of 5`} subValue="Founder Evolution Pyramid" />
          <MetricBox label="Agents recommended" value={`${results.investment.activeAgentCount}`} subValue={`${results.investment.recommendedStartCount} to start`} />
        </View>

        <SectionHeading num="02" title="Business Profile" />
        <View style={s.card}>
          <View style={[s.row, { flexWrap: "wrap" }]}>
            <View style={{ width: "50%", marginBottom: 6 }}>
              <Text style={s.th}>Industry</Text>
              <Text style={s.td}>{profile.company.industry || "—"}</Text>
            </View>
            <View style={{ width: "50%", marginBottom: 6 }}>
              <Text style={s.th}>Business model / type</Text>
              <Text style={s.td}>
                {profile.company.businessModel || "—"} · {profile.company.businessType || "—"}
              </Text>
            </View>
            <View style={{ width: "50%", marginBottom: 6 }}>
              <Text style={s.th}>Annual revenue</Text>
              <Text style={s.td}>{profile.company.annualRevenue ? formatINR(profile.company.annualRevenue) : "—"}</Text>
            </View>
            <View style={{ width: "50%", marginBottom: 6 }}>
              <Text style={s.th}>Employees</Text>
              <Text style={s.td}>{profile.company.employeeCount || "—"}</Text>
            </View>
            <View style={{ width: "50%", marginBottom: 6 }}>
              <Text style={s.th}>{archetypeLabels.idealCustomer}</Text>
              <Text style={s.td}>{profile.customer.idealCustomer || "—"}</Text>
            </View>
            <View style={{ width: "50%", marginBottom: 6 }}>
              <Text style={s.th}>{archetypeLabels.averageDealSize}</Text>
              <Text style={s.td}>{profile.customer.averageDealSize ? formatINR(profile.customer.averageDealSize) : "—"}</Text>
            </View>
          </View>
        </View>

        <Text style={s.h3}>Pain points identified</Text>
        <View style={s.cardLight}>
          {results.heatmap.length === 0 ? (
            <Text style={s.muted}>None selected.</Text>
          ) : (
            results.heatmap.map((row, i) => (
              <View key={i} style={[s.row, { justifyContent: "space-between", marginBottom: 4 }]}>
                <Text style={s.td}>
                  {row.area} — {row.observation}
                </Text>
                <Text style={[s.badge, { backgroundColor: row.impact === "High" ? color.amberBg : color.bg, color: row.impact === "High" ? color.amber : color.muted }]}>
                  {row.impact}
                </Text>
              </View>
            ))
          )}
          {profile.otherPainPoints && <Text style={[s.p, { marginTop: 6 }]}>Additional context: {profile.otherPainPoints}</Text>}
        </View>

        <Footer companyLabel={companyLabel} />
      </Page>

      {/* Maturity Layer + Workflows */}
      <Page size="A4" style={s.page}>
        <SectionHeading num="03" title="Maturity Layer" />
        <Text style={s.p}>
          The Founder Evolution Pyramid, applied: an AI agent is only as good as the process, visibility, and automation
          underneath it.
        </Text>
        <View style={s.metricGrid}>
          <MetricBox label="Process OS" value={`${results.maturity.process}`} subValue="How work gets done" />
          <MetricBox label="Visibility OS" value={`${results.maturity.visibility}`} subValue="See the business" />
          <MetricBox label="Automation OS" value={`${results.maturity.automation}`} subValue="Reduce manual work" />
        </View>

        <SectionHeading num="04" title="Current & Future Workflows" />
        {results.departmentWorkflows.map((dept) => (
          <View key={dept.department} style={{ marginBottom: 14 }}>
            <Text style={s.h3}>{dept.label}</Text>
            <Text style={[s.muted, { marginBottom: 3 }]}>Current</Text>
            <WorkflowRow steps={dept.current} />
            <Text style={[s.muted, { marginTop: 4, marginBottom: 3 }]}>Future</Text>
            <WorkflowRow steps={dept.future} highlighted={dept.highlightedFutureSteps} />
          </View>
        ))}

        <Footer companyLabel={companyLabel} />
      </Page>

      {/* AI Opportunity Matrix + AI Workforce Blueprint */}
      <Page size="A4" style={s.page}>
        <SectionHeading num="05" title="AI Opportunity Matrix" />
        {results.opportunities.map((opp, i) => (
          <View key={i} style={s.card}>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Text style={s.h3}>{opp.opportunity}</Text>
              <Text style={{ color: color.teal }}>{"★".repeat(opp.priorityStars)}{"☆".repeat(5 - opp.priorityStars)}</Text>
            </View>
            <Text style={s.muted}>ROI: {opp.roi} · Difficulty: {opp.difficulty}</Text>
            {opp.foundationNeeded && (
              <Text style={[s.muted, { color: color.amber, marginTop: 3 }]}>⚠ Foundation needed: {opp.foundationNeeded.note}</Text>
            )}
          </View>
        ))}

        <SectionHeading num="06" title="AI Workforce Blueprint" />
        <Text style={s.p}>
          Not a tool list — a coordinated team: a supervisor agent orchestrating specialists, a reflection layer before
          anything reaches a human, and humans keeping the final call on high-stakes decisions.
        </Text>
        {org.supervisor && (
          <View style={s.cardLight}>
            <Text style={s.h3}>{org.supervisor.label}</Text>
            <Text style={s.muted}>Orchestrator</Text>
          </View>
        )}
        <View style={[s.row, { flexWrap: "wrap", gap: 6 }]}>
          {org.specialists.map((sp, i) => (
            <View key={i} style={[s.workflowStep, { paddingVertical: 6 }]}>
              <Text>{sp.label}</Text>
              <Text style={{ fontSize: 7, color: color.muted, marginTop: 1 }}>
                {sp.phase === "start" ? "Start now" : sp.phase === "priority" ? "Priority, phase 2" : "Roadmap"}
              </Text>
            </View>
          ))}
        </View>
        {org.humanRoles.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={s.muted}>Human teams retained: {org.humanRoles.map((h) => h.department).join(", ")}</Text>
          </View>
        )}

        <Footer companyLabel={companyLabel} />
      </Page>

      {/* Financial Impact + Investment & ROI */}
      <Page size="A4" style={s.page}>
        <SectionHeading num="07" title="Financial Impact Assessment" />
        <Text style={s.h3}>Revenue growth</Text>
        <View style={s.metricGrid}>
          <MetricBox label="Revenue growth" value={pct(f.revenueGrowth.revenueGrowthPct)} subValue={f.revenueGrowth.additionalRevenueMonthly ? `+${formatINR(f.revenueGrowth.additionalRevenueMonthly.value)}/mo` : undefined} source={f.revenueGrowth.revenueGrowthPct.source} />
          <MetricBox label="Lead leakage recovered" value={pct(f.revenueGrowth.leadLeakageReductionPct, "-")} subValue={f.revenueGrowth.additionalDealsPerMonth ? `+${f.revenueGrowth.additionalDealsPerMonth.value} ${archetypeLabels.dealUnit}s/mo` : undefined} source={f.revenueGrowth.leadLeakageReductionPct.source} />
          {f.revenueGrowth.growthTargetPct !== undefined && (
            <MetricBox label="Their 6-12mo target" value={`${f.revenueGrowth.growthTargetPct}%`} subValue={`AI closes ~${f.revenueGrowth.pctOfTargetClosed}%`} />
          )}
        </View>
        <Text style={s.h3}>Productivity, cost, and experience</Text>
        <View style={s.metricGrid}>
          <MetricBox label="CEO time saved" value={`${f.productivityGains.ceoHoursSavedPerWeek.value} hrs/wk`} source={f.productivityGains.ceoHoursSavedPerWeek.source} />
          <MetricBox label="Team capacity increase" value={pct(f.productivityGains.productivityBoostPct)} source={f.productivityGains.productivityBoostPct.source} />
          <MetricBox label="Support cost" value={pct(f.costSavings.supportCostReductionPct, "-")} subValue={f.costSavings.supportCostSavingsMonthly ? `-${formatINR(f.costSavings.supportCostSavingsMonthly.value)}/mo` : undefined} source={f.costSavings.supportCostReductionPct.source} />
          <MetricBox
            label="Response time"
            value={pct(f.customerExperience.responseTimeReductionPct, "-")}
            subValue={f.customerExperience.currentResponseTimeHours !== undefined ? `${f.customerExperience.currentResponseTimeHours}h → ${f.customerExperience.projectedResponseTimeHours}h` : undefined}
            source={f.customerExperience.responseTimeReductionPct.source}
          />
        </View>
        <Text style={[s.muted, { marginBottom: 10 }]}>
          Calculated = pure math on real numbers. Estimated = a real baseline × an assumption rate. Directional = assumption
          range only, no business-specific input yet.
        </Text>

        {results.profitImpact && (
          <>
            <Text style={s.h3}>Profit impact (margin-adjusted — separate from payback below)</Text>
            <View style={s.metricGrid}>
              <MetricBox label="Margin used" value={`${results.profitImpact.marginPctUsed}%`} subValue={results.profitImpact.marginSource === "estimated" ? "Their own margin" : "Typical default"} source={results.profitImpact.marginSource} />
              <MetricBox label="Monthly profit impact" value={`+${formatINR(results.profitImpact.monthlyProfitImpact)}/mo`} />
            </View>
          </>
        )}

        <SectionHeading num="08" title="Investment Estimate & ROI Projection" />
        <View style={s.metricGrid}>
          <MetricBox label="One-time investment" value={formatINR(results.investment.oneTimeInvestment)} subValue="Setup & onboarding" />
          <MetricBox label="Monthly recurring" value={formatINR(results.investment.monthlyRecurring)} subValue={`Includes infra · ${results.investment.activeAgentCount} agents`} />
          <MetricBox
            label="Expected payback"
            value={results.investment.paybackDays !== undefined ? `~${results.investment.paybackDays} days` : "—"}
            subValue={results.investment.monthlyBenefit ? `Based on ${formatINR(results.investment.monthlyBenefit)}/mo benefit` : undefined}
          />
        </View>

        {financingOptions.length > 0 && (
          <>
            <Text style={s.h3}>Investment options</Text>
            <View style={[s.row, { gap: 8, marginBottom: 10 }]}>
              {financingOptions.map((opt, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: color.bg, borderRadius: 6, padding: 8 }}>
                  <Text style={[s.td, { fontFamily: "Helvetica-Bold" }]}>{opt.label}</Text>
                  <Text style={s.muted}>Due at signing: {opt.upfrontDue > 0 ? formatINR(opt.upfrontDue) : "₹0"}</Text>
                  <Text style={s.muted}>Monthly: {formatINR(opt.monthlyCost)}</Text>
                  <Text style={s.muted}>First-year total: {formatINR(opt.totalFirstYearCost)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Footer companyLabel={companyLabel} />
      </Page>

      {/* Roadmap + Risks & Next Steps */}
      <Page size="A4" style={s.page}>
        <SectionHeading num="09" title="90-Day Transformation Roadmap" />
        <View style={[s.row, { gap: 8 }]}>
          {deploymentOrder.slice(0, 3).map((o, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: color.bg, borderRadius: 6, padding: 10 }}>
              <Text style={{ fontSize: 8, color: color.purple, textTransform: "uppercase" }}>Month {i + 1}</Text>
              <Text style={[s.td, { marginTop: 3 }]}>{o.opportunity}</Text>
            </View>
          ))}
        </View>

        <SectionHeading num="10" title="Risks & Assumptions" />
        <View style={s.cardLight}>
          <Text style={s.p}>
            • Every figure in this blueprint is tagged Calculated, Estimated, or Directional — see Section 07 for what each
            means. Directional figures are conservative planning assumptions, not guarantees.
          </Text>
          <Text style={s.p}>
            • Revenue growth is capped based on business type: capacity-constrained businesses (product/manufacturing) are
            modeled conservatively regardless of funnel math, since production capacity — not sales effectiveness — is
            typically the real constraint.
          </Text>
          <Text style={s.p}>
            • Payback is calculated on a cash basis (revenue growth + cost savings); Profit Impact is a separate,
            margin-adjusted view and is not blended into the payback figure.
          </Text>
          <Text style={s.p}>• Actual results depend on execution quality, data availability, and organizational adoption — this blueprint is a starting estimate, not a contractual commitment.</Text>
        </View>

        <SectionHeading num="11" title="Recommended Next Steps" />
        <View style={s.card}>
          <Text style={s.p}>
            1. Validate the assumptions in this blueprint together — particularly the {results.investment.recommendedStartCount} agents recommended to start.
          </Text>
          <Text style={s.p}>2. Connect the data sources needed for the priority agents (see Maturity Layer, Section 03).</Text>
          <Text style={s.p}>3. Finalize the AI workforce deployment plan and timeline.</Text>
          <Text style={[s.p, { marginTop: 8, fontFamily: "Helvetica-Bold" }]}>Contact: prashanth@growthaspire.com</Text>
        </View>

        <Footer companyLabel={companyLabel} />
      </Page>
    </Document>
  );
}
