# AI Business Discovery Studio™

The Executive AI Transformation Assessment — a live, session-based tool for running a "business MRI" with a prospect in the room and handing them a blueprint at the end.

## Navigation

Rebuilt as a 7-step paginated wizard with a sidebar (desktop) / top progress bar (mobile), inspired by the reference UX you shared:

1. **Start Discovery** — website enrichment (Option A) or manual industry pick (Option B)
2. **Business Profile** — all 5 sections + optional Business Metrics + Data & Systems Readiness
3. **Workflow Mapping** — current-state workflows + quantified pain ("what this is costing today") — the wound before the cure
4. **AI Opportunities** — AI Readiness Score gauge + Opportunity Matrix + Recommended AI Workforce
5. **Future Workflow** — current vs. future side-by-side, human/AI/collaborative/system ownership tags, 90-day roadmap
6. **AI Workforce Org** — Deliverable 7: a Supervisor Agent orchestrating named Specialist Agents (Lead Agent, Data Analyst Agent, Market Research Agent, etc., pulled straight from the workflow config), a Reflection & Quality Check layer, then human teams retaining high-stakes judgment
7. **ROI & Payback** — Financial Impact Assessment (4 dimensions) + Investment & Payback estimate, with the math shown transparently
8. **Executive Blueprint** — summary, recommended deployment order, next-action CTA

Results are computed live from whatever's in the profile at any point — there's no separate "Generate" button anymore. Moving forward in the wizard is what reveals them, and everything updates if you go back and change something.

## Financial methodology

Every number in Step 7 is tagged **Calculated**, **Estimated**, or **Directional**:
- **Calculated** — pure arithmetic on real numbers the business gave you (e.g. recovered leads × their conversion rate), no external assumption at all.
- **Estimated** — a real baseline they gave you (approval hours, support cost, response time) × an assumption rate from `lib/assumptions.ts`.
- **Directional** — no business-specific number yet, just a conservative assumption range's point estimate.

The assumption ranges in `lib/assumptions.ts` are **not** borrowed from published AI/chatbot statistics — that space is dominated by inconsistent marketing-blog numbers not worth citing to a client. They're wide, conservative ranges meant to be tuned from GrowthAspire's own engagement outcomes over time; edit them freely as real results come in.

## Data capture improvements

- **Tech stack** is now multi-select per category (some businesses run more than one CRM) plus a utilization maturity rating (*Not in place / In place, underused / In place, well-utilized*) — "they have a CRM nobody uses" is now a capturable, diagnostic finding.
- **AI adoption** moved from one vague global checkbox to per-department capture: which departments already use AI, what for (content, research, customer replies, data analysis, coding), and how embedded it is (ad hoc → team habit → deeply integrated). Feeds the AI Readiness Score more meaningfully than a single flag ever could.

## Agent Productivity Value — a second lens

The funnel-based Financial Impact numbers are deliberately conservative (that's the whole point of the Calculated/Estimated/Directional system), which can make payback look weaker than the pitch deserves. Added a second, complementary lens in Step 7 (`lib/agentProductivity.ts`): **each agent valued as a fraction of an equivalent human hire** — e.g. a Follow-up Agent ≈ 40-80% of a sales follow-up coordinator's capacity, worth whatever that fraction of a real hire would cost, compared against what the agent actually costs.

- Uses the business's own headcount + team-cost numbers when both are available (tagged Calculated); falls back to a typical fully-loaded cost band per role when not (tagged Directional) — both configurable in `lib/assumptions.ts`.
- **Conservative / Moderate / Aggressive toggle** lets you dial how generous the human-equivalent fraction is, live in the room — this is the "give the user an option" piece.
- Explicitly labeled as a separate lens from the Financial Impact section, not additive to it — the two can't contradict each other because they're not the same calculation, just presented side by side so you can use whichever lands better with a given audience.

## Workflow diagrams — swimlanes, not a flat list

Rebuilt from a single row of boxes into a proper swimlane diagram (`components/WorkflowDiagram.tsx`):
- **Four lanes**: Touchpoints (system/infra), AI Agents, Human + AI, Human Team — steps sit in the lane matching their owner, with a small numbered badge for reading order since position now jumps between lanes.
- **The Current workflow's AI Agents lane is visibly empty** — that emptiness *is* the story, no annotation needed.
- **The Future workflow shows work moving into that lane** — directly visualizing the transformation instead of just describing it.
- **Amber ⚠ flags mark the exact bottleneck step** on the Current diagram (via the new `currentPainSteps` mapping in `departmentTemplates.ts`), not just a name in a separate heatmap table.
- **Green ✦ new flags** mark exactly which Future step was unlocked by a pain point actually selected.
- Small line icons per owner type (person / chip / linked-circles / plug) for fast scanning without reading every label.

## Focus selector (Step 1)

Before any data capture, the session asks where the focus actually is: **Primary goal** (Revenue increase / Profit increase / Reduce costs / Efficiency increase) and **Focus area** (Customer-facing vs Internal). This reorders the Financial Impact groups in Step 7 to lead with whatever was said to matter, and nudges the department picker (e.g. customer-facing auto-adds Marketing). Choosing "Internal" surfaces an honest heads-up that Operations/HR/Finance workflow templates don't exist yet.

## Two bugs fixed from real numbers

Tracing a real set of inputs through the engine surfaced two credibility problems, both fixed:

1. **Cliff-edge rounding** — deal counts were rounded to a whole number *before* multiplying by deal size, so a swing from 0.92 to 1 deal could jump the revenue figure by an entire deal size in one step. Fixed: the ₹ calculation now uses the fractional deal count throughout; only the *display* text rounds (to one decimal).
2. **Contradicting %/₹ figures** — Revenue Growth % and the ₹ figure were computed on two separate paths and could quietly disagree in the same card. Fixed: whenever the ₹ figure is "Calculated" (real funnel math), the % is now derived *from* that ₹ figure instead of being computed separately — they can no longer contradict each other.

Marketing spend and Sales team cost, previously captured but unused, now feed the new Current-vs-AI comparison in Step 7.

## Investment model

Replaced the flat platform-fee formula with what's actually being sold: a **one-time setup investment** (₹2L-3L, tiered by agent count) plus **monthly recurring** (₹20K base including infra, +₹8K per additional agent) — both editable in `lib/assumptions.ts`. However many pain points are selected, only the top N (default 4) are tagged "Start now" in the AI Workforce Org and recommended deployment order — the rest become "Priority, phase 2" or "Roadmap," so the ask is a realistic launch set, not a 10-agent day-one pitch.

## Exact figures instead of bands

Annual revenue and average deal size are now exact ₹ number inputs, not chip-select bands — this is what made the fractional-deal-size fix meaningful (a band midpoint was itself adding imprecision on top of the rounding bug).

## Visual design

Reskinned to match the reference UX you shared: deep purple/cyan glassmorphism palette (`#0b1020` background with a radial gradient, `#7c5cff` purple and `#00d4ff` cyan accents), Inter throughout (no separate display/mono faces), 20px-rounded cards, pill-shaped chips and badges, gradient buttons. Workflow steps kept their human/AI/collaborative/system ownership tags (recolored to fit the new palette) since that's core to what this tool actually does that the reference doesn't — dropping it would have lost the Deliverable 6 value. Workflow diagrams are now horizontal (node → arrow → node) instead of vertical, matching the reference.

## What's built

- **Step 1 — URL entry.** `/api/enrich` fetches the homepage server-side (8s timeout), strips it to title/meta description/visible text, and asks Claude to infer industry, business model, products/services tags, and growth objectives. Pre-fills the Company section of the profile. If the site can't be fetched or parsed, it fails gracefully with a message telling you to fill in manually — never a hard error.
- **Step 2 — Business profile.** All 5 sections from Deliverable 1, chip/dropdown inputs only, jump-to-section nav. Department picker enforces Sales + CEO as mandatory, gates any department without an authored workflow template ("coming soon"). Plus an optional **Business Metrics** section — headcount by team, marketing/sales/support spend, monthly leads, conversion rate, response time, revenue baseline, and their own 6-12 month growth target. And a **Data & Systems Readiness** section — open questions (where does the data live, existing dashboards, data quality, freeform notes) that don't feed the numbers but capture context for the eventual narrative summary and for you to reference live.
- **Step 3 — Results**, triggered by Generate:
  - Pain Point Heatmap
  - AI Opportunity Matrix
  - Current vs. Future workflow toggle, with the scan-line sweep animation (the "MRI" signature) — for Sales, CEO, and Support
  - Financial Impact Assessment
  - PDF download button is present but disabled — wired up in Phase 3d

Everything in Step 3 runs from a single rules engine (`lib/rulesEngine.ts`) reading a single config file (`lib/departmentTemplates.ts`). No AI call happens anywhere in this build yet — it's fully deterministic, which is why it's instant.

## Not built yet (by design, per the locked scope)

- No auth, no database — this is intentional, not missing. Refreshing the tab resets the session.
- Claude-generated narrative summary for the blueprint — Phase 3c
- PDF export of the full Executive Blueprint — Phase 3d
- Marketing / Customer Success / Finance / HR / Operations workflow templates — add anytime by authoring `currentWorkflow` + `futureWorkflow` + `painPointTriggers` in `lib/departmentTemplates.ts` and flipping `hasTemplate` to `true`. The department picker and rules engine pick it up automatically, no other code changes needed.

## Running locally

```bash
cp .env.local.example .env.local   # then paste your Anthropic API key in
npm install
npm run dev
```

Open http://localhost:3000. Without a valid `ANTHROPIC_API_KEY`, the Enrich button will fail gracefully and tell you to fill the profile in manually — the rest of the app works fine either way.

Note: the build fetches Space Grotesk / Inter / IBM Plex Mono from Google Fonts at build time (via `next/font/google`) — this requires normal internet access, which your local machine and Vercel both have.

## Deploying

Push to GitHub, then import the repo in Vercel. Add `ANTHROPIC_API_KEY` under Project Settings → Environment Variables before your first deploy — the enrich route will 500 without it (though the UI still degrades gracefully to manual entry).

## Design system

Deep "scan-room" navy background with a diagnostic-teal accent — the whole visual language is built around the brief's own framing: "a business MRI, not a questionnaire." Numbers render in IBM Plex Mono like instrument readouts; the scan-line sweep on Generate performs the MRI metaphor rather than just naming it.

## Project status summary (paste into next chat)

**Locked scope:** session-based (no auth/DB), live-demo tool, 8-step paginated wizard (sidebar + progress bar). Step 7 now has two complementary financial lenses: the conservative funnel-based Financial Impact (Calculated/Estimated/Directional tags) AND a new **Agent Productivity Value** section (`lib/agentProductivity.ts`) valuing each agent as a fraction of an equivalent human hire, with a live Conservative/Moderate/Aggressive toggle — not additive to the funnel numbers, a separate persuasive lens. Workflow diagrams are swimlanes (`components/WorkflowDiagram.tsx`) — lanes by owner, numbered steps, amber bottleneck flags on Current, green "new" flags on Future. Step 1 opens with a Focus selector (primary goal + customer-facing vs internal). Visual design matches the reference UX (purple/cyan palette, Inter font, rounded cards/pills). Steps: Start Discovery (+ focus) → Business Profile (5 sections, exact ₹ figures, richer tech stack + maturity, per-department AI adoption) → Workflow Mapping (swimlane current-state + quantified leakage) → AI Opportunities → Future Workflow (stacked swimlane current/future) → AI Workforce Org (Start now / Priority phase-2 / Roadmap) → ROI & Payback (financials + agent productivity value + investment/payback) → Executive Blueprint. Two real bugs fixed earlier by tracing actual client numbers: a rounding cliff-edge in deal-count → revenue, and Revenue Growth %/₹ figures that could contradict each other. Results compute live from the profile at any point. Workflow library covers Sales + CEO (mandatory) + Support + Marketing; Customer Success/Finance/HR/Operations still gated "coming soon." Real website enrichment wired up (`/api/enrich`).

**Next up (in order):** (1) Claude-generated narrative summary layered into the Executive Blueprint step; (2) PDF export rendering the same data model as the on-screen Studio.

**Stack:** Next.js 15.5 (App Router) + Tailwind, one backend service (Anthropic API key) — no Supabase, no auth provider.
