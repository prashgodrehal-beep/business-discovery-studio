"use client";

import { useEffect, useRef, useState } from "react";
import { StepOwner, WorkflowStep } from "@/lib/types";

interface Props {
  steps: WorkflowStep[];
  highlighted?: string[]; // future-state "new AI step" flags
  bottleneck?: string[]; // current-state "this is the pain" flags
  playScan: boolean;
}

const ROW_HEIGHT = 92;
const COL_WIDTH = 150;
const LABEL_WIDTH = 118;

const lanes: { owner: StepOwner; label: string; band: string }[] = [
  { owner: "system", label: "Touchpoints", band: "bg-white/[0.02]" },
  { owner: "ai", label: "AI Agents", band: "bg-scan-teal/[0.05]" },
  { owner: "collaborative", label: "Human + AI", band: "bg-scan-accent/[0.06]" },
  { owner: "human", label: "Human Team", band: "bg-[#378ADD]/[0.06]" },
];

const ownerBorder: Record<StepOwner, string> = {
  system: "border-scan-border",
  ai: "border-scan-teal",
  collaborative: "border-scan-accent",
  human: "border-[#378ADD]",
};

function OwnerIcon({ owner }: { owner: StepOwner }) {
  const stroke = { system: "#8a97b8", ai: "#00d4ff", collaborative: "#7c5cff", human: "#378ADD" }[owner];
  if (owner === "human") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth="2" />
        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (owner === "ai") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="6" width="12" height="12" rx="2" stroke={stroke} strokeWidth="2" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (owner === "collaborative") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="12" r="5" stroke={stroke} strokeWidth="2" />
        <circle cx="16" cy="12" r="5" stroke={stroke} strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth="2" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function WorkflowDiagram({ steps, highlighted = [], bottleneck = [], playScan }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(600);

  useEffect(() => {
    if (containerRef.current) setDistance(containerRef.current.scrollWidth);
  }, [steps]);

  const gridWidth = LABEL_WIDTH + steps.length * COL_WIDTH;
  const gridHeight = lanes.length * ROW_HEIGHT;

  return (
    <div className="overflow-x-auto pb-2">
      <div ref={containerRef} className="relative" style={{ width: gridWidth, height: gridHeight }}>
        {/* Lane bands */}
        {lanes.map((lane, i) => (
          <div
            key={lane.owner}
            className={`absolute left-0 right-0 ${lane.band}`}
            style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
          />
        ))}

        {/* Sticky lane labels */}
        {lanes.map((lane, i) => (
          <div
            key={`label-${lane.owner}`}
            className="sticky left-0 z-20 flex items-center px-3 text-xs font-semibold text-scan-muted"
            style={{ position: "absolute", top: i * ROW_HEIGHT, height: ROW_HEIGHT, width: LABEL_WIDTH }}
          >
            {lane.label}
          </div>
        ))}

        {playScan && (
          <div
            className="animate-scanlineX pointer-events-none absolute bottom-0 top-0 z-30 w-0.5 bg-scan-teal shadow-[0_0_8px_2px_rgba(0,212,255,0.6)]"
            style={{ left: LABEL_WIDTH, ["--scan-distance" as string]: `${distance - LABEL_WIDTH}px` }}
          />
        )}

        {/* Step nodes */}
        {steps.map((step, i) => {
          const laneIndex = lanes.findIndex((l) => l.owner === step.owner);
          const isNew = highlighted.includes(step.label);
          const isBottleneck = bottleneck.includes(step.label);
          return (
            <div
              key={`${step.label}-${i}`}
              className="absolute z-10 flex items-center justify-center"
              style={{ left: LABEL_WIDTH + i * COL_WIDTH, top: laneIndex * ROW_HEIGHT, width: COL_WIDTH, height: ROW_HEIGHT, padding: 8 }}
            >
              <div
                className={`relative flex w-full flex-col items-center gap-1 rounded-[12px] border-2 bg-[#101735] px-2.5 py-2 text-center ${ownerBorder[step.owner]} ${
                  isBottleneck ? "ring-2 ring-scan-amber" : isNew ? "ring-2 ring-scan-green" : ""
                }`}
              >
                <span className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-scan-border bg-scan-bg text-[10px] text-scan-muted">
                  {i + 1}
                </span>
                {isBottleneck && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-scan-amberDim px-1.5 py-0.5 text-[9px] font-bold text-scan-amber">
                    ⚠
                  </span>
                )}
                {isNew && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-scan-greenDim px-1.5 py-0.5 text-[9px] font-bold text-scan-green">
                    ✦ new
                  </span>
                )}
                <OwnerIcon owner={step.owner} />
                <span className="text-xs leading-tight text-[#e9efff]">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
