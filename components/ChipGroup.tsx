"use client";

interface ChipGroupProps {
  options: { key: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
  disabledKeys?: string[];
}

export default function ChipGroup({ options, selected, onChange, multi = true, disabledKeys = [] }: ChipGroupProps) {
  function toggle(key: string) {
    if (disabledKeys.includes(key)) return;
    if (multi) {
      onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
    } else {
      onChange([key]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.key);
        const isDisabled = disabledKeys.includes(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            disabled={isDisabled}
            onClick={() => toggle(opt.key)}
            className={`focus-ring rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              isDisabled
                ? "cursor-not-allowed bg-scan-surface2 text-scan-muted/50"
                : isSelected
                ? "bg-scan-accent text-white"
                : "bg-[#1d2857] text-[#bfd0ff] hover:brightness-125"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
