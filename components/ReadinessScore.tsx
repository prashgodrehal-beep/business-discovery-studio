"use client";

export default function ReadinessScore({ score }: { score: number }) {
  const verdict =
    score >= 75 ? "Strong opportunity for AI transformation" : score >= 55 ? "Solid opportunity, clear starting points" : "Early-stage — foundational fixes first";

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div
        className="relative grid h-[150px] w-[150px] shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(#22c55e 0 ${score}%, #24305d ${score}% 100%)` }}
      >
        <div className="absolute h-[112px] w-[112px] rounded-full bg-[#111936]" />
        <span className="relative z-[2] text-[34px] font-black text-scan-text">{score}</span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-scan-teal">AI Readiness Score</p>
        <p className="mt-1 max-w-xs text-sm text-scan-text">{verdict}</p>
      </div>
    </div>
  );
}
