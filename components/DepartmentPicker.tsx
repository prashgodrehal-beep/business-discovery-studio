"use client";

import { departmentTemplates } from "@/lib/departmentTemplates";
import { DepartmentKey } from "@/lib/types";

interface Props {
  selected: DepartmentKey[];
  onChange: (next: DepartmentKey[]) => void;
}

export default function DepartmentPicker({ selected, onChange }: Props) {
  const entries = Object.entries(departmentTemplates) as [DepartmentKey, (typeof departmentTemplates)[DepartmentKey]][];

  function toggle(key: DepartmentKey, template: (typeof departmentTemplates)[DepartmentKey]) {
    if (template.mandatory || !template.hasTemplate) return;
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {entries.map(([key, t]) => {
        const isSelected = t.mandatory || selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            disabled={t.mandatory || !t.hasTemplate}
            onClick={() => toggle(key, t)}
            className={`focus-ring flex flex-col items-start gap-1 rounded-md border px-3 py-2 text-left transition-colors ${
              !t.hasTemplate
                ? "cursor-not-allowed border-scan-border text-scan-muted/40"
                : isSelected
                ? "border-scan-teal bg-scan-tealDim text-scan-teal"
                : "border-scan-border text-scan-muted hover:border-scan-muted hover:text-scan-text"
            }`}
          >
            <span className="text-sm">{t.label}</span>
            {t.mandatory && <span className="font-mono text-[11px] text-scan-teal/70">mandatory</span>}
            {!t.hasTemplate && <span className="font-mono text-[11px]">coming soon</span>}
          </button>
        );
      })}
    </div>
  );
}
