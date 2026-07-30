"use client";

import { useState } from "react";

const UNITS = [
  { key: "1", label: "₹" },
  { key: "1000", label: "K" },
  { key: "100000", label: "L" },
  { key: "10000000", label: "Cr" },
];

// Picks the largest unit that displays the value as a whole number, so a
// pre-filled ₹1,00,00,000 shows as "1 Cr" instead of "10000000 ₹".
function bestUnitFor(value: number): string {
  for (const u of [...UNITS].reverse()) {
    const mult = Number(u.key);
    if (mult > 1 && value !== 0 && value % mult === 0) return u.key;
  }
  return "1";
}

export default function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const [unit, setUnit] = useState<string>(() => (value ? bestUnitFor(value) : "100000"));
  const [amount, setAmount] = useState<string>(() => (value ? String(value / Number(unit)) : ""));

  function update(nextAmount: string, nextUnit: string) {
    setAmount(nextAmount);
    setUnit(nextUnit);
    if (nextAmount === "") {
      onChange(undefined);
      return;
    }
    const parsed = Number(nextAmount);
    onChange(Number.isNaN(parsed) ? undefined : Math.round(parsed * Number(nextUnit)));
  }

  return (
    <div>
      <p className="mb-2 text-xs text-scan-muted">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-scan-muted">₹</span>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => update(e.target.value, unit)}
          placeholder="—"
          className="field-input w-28"
        />
        <div className="flex rounded-xl border border-scan-border p-0.5">
          {UNITS.map((u) => (
            <button
              key={u.key}
              type="button"
              onClick={() => update(amount, u.key)}
              className={`focus-ring rounded-lg px-2 py-1.5 text-xs ${unit === u.key ? "bg-scan-tealDim text-scan-teal" : "text-scan-muted"}`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
      {amount !== "" && !Number.isNaN(Number(amount)) && (
        <p className="mt-1 text-xs text-scan-muted">= ₹{Math.round(Number(amount) * Number(unit)).toLocaleString("en-IN")}</p>
      )}
    </div>
  );
}
