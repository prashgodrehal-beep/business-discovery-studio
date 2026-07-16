"use client";

import { AgentPhase, WorkforceOrg } from "@/lib/workforce";

const phaseStyle: Record<AgentPhase, string> = {
  start: "border-scan-teal bg-scan-tealDim text-scan-teal",
  priority: "border-scan-accent/50 bg-[#1a1440] text-[#c9beff]",
  roadmap: "border-scan-border bg-[#101735] text-scan-muted",
};

const phaseLabel: Record<AgentPhase, string> = {
  start: "Start now",
  priority: "Priority, phase 2",
  roadmap: "Roadmap",
};

function Node({ label, phase, sub }: { label: string; phase: AgentPhase | "human"; sub?: string }) {
  const toneClass = phase === "human" ? "border-[#378ADD]/50 bg-[#0f1f38] text-[#a9d0ff]" : phaseStyle[phase];
  return (
    <div className={`rounded-[14px] border px-4 py-2.5 text-center text-sm ${toneClass}`}>
      <p>{label}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide opacity-80">{sub ?? (phase !== "human" ? phaseLabel[phase] : undefined)}</p>
    </div>
  );
}

function Connector() {
  return <div className="my-3 flex justify-center text-scan-muted">↓</div>;
}

export default function AIWorkforceOrg({ org, ceoLabel = "CEO" }: { org: WorkforceOrg; ceoLabel?: string }) {
  if (org.specialists.length === 0 && !org.supervisor) {
    return <p className="text-sm text-scan-muted">No AI agents in scope yet — select departments and pain points earlier in the wizard.</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <Node label={ceoLabel} phase="human" sub="Ultimate authority" />

      {org.supervisor && (
        <>
          <Connector />
          <Node label={org.supervisor.label} phase={org.supervisor.phase} sub="Orchestrator" />
        </>
      )}

      {org.specialists.length > 0 && (
        <>
          <Connector />
          <div className="flex flex-wrap justify-center gap-2.5">
            {org.specialists.map((s) => (
              <Node key={s.label} label={s.label} phase={s.phase} />
            ))}
          </div>
        </>
      )}

      <div className="my-4 w-full max-w-xl rounded-full border border-dashed border-scan-border py-2 text-center text-xs uppercase tracking-wide text-scan-muted">
        Reflection &amp; quality check — before anything reaches a human on a high-stakes call
      </div>

      {org.humanRoles.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2.5">
          {org.humanRoles.map((h) => (
            <Node key={h.department} label={`${h.department} team`} phase="human" sub={h.roles.join(" · ")} />
          ))}
        </div>
      )}
    </div>
  );
}
