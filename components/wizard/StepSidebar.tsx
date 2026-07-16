"use client";

interface Props {
  steps: string[];
  activeIndex: number;
  onStepClick: (i: number) => void;
}

export default function StepSidebar({ steps, activeIndex, onStepClick }: Props) {
  const progressPct = ((activeIndex + 1) / steps.length) * 100;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[285px] shrink-0 border-r border-scan-border bg-[#0a0f22]/88 px-5 py-[26px] md:block">
        <p className="mb-2 text-[21px] font-extrabold leading-[1.15] text-scan-text">
          AI Business
          <br />
          Discovery Studio™
        </p>
        <p className="mb-7 text-[13px] text-scan-muted">Discover → Decide → Deploy</p>
        <nav className="space-y-2">
          {steps.map((label, i) => (
            <button
              key={label}
              onClick={() => onStepClick(i)}
              className={`focus-ring flex w-full items-center gap-3 rounded-xl px-2.5 py-3 text-left text-sm transition-colors ${
                i === activeIndex ? "text-white" : "text-scan-muted hover:text-scan-text"
              }`}
              style={
                i === activeIndex
                  ? { background: "linear-gradient(90deg, rgba(124,92,255,.24), rgba(0,212,255,.08))" }
                  : undefined
              }
            >
              <span
                className={`flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border text-[13px] ${
                  i === activeIndex ? "border-0 bg-scan-accent text-white" : "border-scan-border"
                }`}
              >
                {i + 1}
              </span>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <div className="border-b border-scan-border px-4 py-3 md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-scan-teal">{steps[activeIndex]}</p>
          <p className="text-xs text-scan-muted">
            {activeIndex + 1} / {steps.length}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-scan-surface2">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #7c5cff, #00d4ff)" }}
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {steps.map((label, i) => (
            <button
              key={label}
              onClick={() => onStepClick(i)}
              className={`focus-ring shrink-0 rounded-md border px-2.5 py-1 text-[11px] ${
                i === activeIndex ? "border-scan-teal text-scan-teal" : "border-scan-border text-scan-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
