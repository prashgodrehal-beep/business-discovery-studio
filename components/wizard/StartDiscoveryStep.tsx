"use client";

import { useState } from "react";
import { FocusArea, FocusGoal, IndustryArchetype } from "@/lib/types";
import { archetypeOptions } from "@/lib/industryArchetypes";

interface Props {
  websiteUrl: string;
  onEnrich: (url: string) => void;
  enriching: boolean;
  status: string | null;
  onManualIndustry: (industry: string) => void;
  focusGoal: FocusGoal;
  focusArea: FocusArea;
  onFocusGoalChange: (v: FocusGoal) => void;
  onFocusAreaChange: (v: FocusArea) => void;
  industryArchetype: IndustryArchetype;
  onIndustryArchetypeChange: (v: IndustryArchetype) => void;
}

const quickIndustries = ["Real Estate", "Coaching / Consulting", "Healthcare", "Manufacturing", "SaaS", "Industrial"];

const focusGoalOptions: { key: FocusGoal; label: string }[] = [
  { key: "revenue", label: "Revenue increase" },
  { key: "profit", label: "Profit increase" },
  { key: "cost", label: "Reduce costs" },
  { key: "efficiency", label: "Efficiency increase" },
];

const focusAreaOptions: { key: FocusArea; label: string }[] = [
  { key: "customer_facing", label: "Customer-facing (Marketing, Sales, Support)" },
  { key: "internal", label: "Internal (Operations, HR, Finance)" },
];

export default function StartDiscoveryStep({
  websiteUrl,
  onEnrich,
  enriching,
  status,
  onManualIndustry,
  focusGoal,
  focusArea,
  onFocusGoalChange,
  onFocusAreaChange,
  industryArchetype,
  onIndustryArchetypeChange,
}: Props) {
  const [value, setValue] = useState(websiteUrl);

  return (
    <div className="hero">
      <span className="pill">For CEOs, Founders & Business Owners</span>
      <h1 className="mt-4 text-[34px] font-extrabold leading-[1.1] text-scan-text sm:text-[42px]">
        Discover where AI can transform this business.
      </h1>
      <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[#cbd7f5]">
        A business MRI, not a questionnaire. Enter the prospect&apos;s website, or start manually if the site won&apos;t give us much to
        work with — either way, you&apos;re driving this live, in the room.
      </p>

      <div className="mt-7 card-light">
        <h3 className="mb-3 text-lg font-bold text-scan-text">Where is the focus?</h3>
        <p className="mb-2 text-xs text-scan-muted">Primary goal</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {focusGoalOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onFocusGoalChange(opt.key)}
              className={`focus-ring rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                focusGoal === opt.key ? "bg-scan-accent text-white" : "bg-[#1d2857] text-[#bfd0ff] hover:brightness-125"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs text-scan-muted">Focus department area</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {focusAreaOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onFocusAreaChange(opt.key)}
              className={`focus-ring rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                focusArea === opt.key ? "bg-scan-accent text-white" : "bg-[#1d2857] text-[#bfd0ff] hover:brightness-125"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {focusArea === "internal" && (
          <p className="mb-4 text-xs text-scan-teal">
            HR, Finance, and Operations will be added to the department picker automatically on the next step.
          </p>
        )}
        <p className="mb-2 text-xs text-scan-muted">Industry — changes the vocabulary the Business Profile form uses</p>
        <div className="flex flex-wrap gap-2">
          {archetypeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onIndustryArchetypeChange(opt.key)}
              className={`focus-ring rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                industryArchetype === opt.key ? "bg-scan-accent text-white" : "bg-[#1d2857] text-[#bfd0ff] hover:brightness-125"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card-light">
          <h3 className="mb-3 text-lg font-bold text-scan-text">Option A: Website analysis</h3>
          <div className="mb-2 flex gap-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://prospectcompany.com"
              className="field-input"
            />
            <button type="button" disabled={enriching || !value} onClick={() => onEnrich(value)} className="btn shrink-0 whitespace-nowrap">
              {enriching ? "Reading…" : "Enrich"}
            </button>
          </div>
          {status && <p className="mt-2 text-xs text-scan-muted">{status}</p>}
          <p className="mt-2 text-sm text-scan-muted">Best when the homepage has real product, service, and customer detail.</p>
        </div>

        <div className="card-light">
          <h3 className="mb-3 text-lg font-bold text-scan-text">Option B: Manual discovery</h3>
          <p className="mb-3 text-sm text-scan-muted">
            Use this when the website is weak, unavailable, or the business is mostly offline. Pick a starting industry:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickIndustries.map((ind) => (
              <button key={ind} onClick={() => onManualIndustry(ind)} className="pill focus-ring hover:brightness-125">
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
