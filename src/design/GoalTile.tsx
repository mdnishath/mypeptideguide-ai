import { ArrowRight, Check } from "lucide-react";
import type { CSSProperties } from "react";
import type { GoalSlug } from "@/core/schema";
import type { Goal } from "@/core/taxonomy";
import { GoalIcon } from "./goalIcon";

/** Each goal owns one colour from the troobiolabs.org family. */
export const GOAL_TONE: Record<GoalSlug, { tone: string; deep: string; wash: string }> = {
  sleep: { tone: "#5a55d6", deep: "#3f3ab3", wash: "#eeedfb" },
  "weight-loss": { tone: "#1486c9", deep: "#0f6fa8", wash: "#e8f3fa" },
  "muscle-growth": { tone: "#2e5bd7", deep: "#2447ad", wash: "#e9eefb" },
  recovery: { tone: "#73b84a", deep: "#4e8a2c", wash: "#eef6e8" },
  longevity: { tone: "#4e8a2c", deep: "#3a6a20", wash: "#e9f2e3" },
  cognitive: { tone: "#8d43b8", deep: "#6f2f96", wash: "#f3ecf9" },
  "skin-hair": { tone: "#e8579c", deep: "#b52a72", wash: "#fce9f2" },
  libido: { tone: "#d9368a", deep: "#b52a72", wash: "#fbe9f2" },
  immune: { tone: "#14b8c9", deep: "#0e8c9e", wash: "#e6f7f9" },
  energy: { tone: "#f47b2a", deep: "#b8561a", wash: "#fef0e6" },
};

export type GoalCount = { total: number; rct: number };

export default function GoalTile({
  goal,
  count,
  selected = false,
  onClick,
  role = "button",
}: {
  goal: Goal;
  count?: GoalCount;
  selected?: boolean;
  onClick: () => void;
  role?: "button" | "radio";
}) {
  const t = GOAL_TONE[goal.slug];
  const style = { "--tone": t.tone, "--tone-deep": t.deep, "--tone-wash": t.wash } as CSSProperties;

  return (
    <button
      type="button"
      role={role}
      aria-checked={role === "radio" ? selected : undefined}
      onClick={onClick}
      style={style}
      className={`tile group relative isolate flex cursor-pointer flex-col gap-4 overflow-hidden rounded-[22px] border bg-paper p-5 text-left ${
        selected ? "border-[var(--tone)] shadow-lift" : "border-line hover:border-[var(--tone)]"
      }`}
    >
      {/* tinted wash, top-left */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: `linear-gradient(150deg, ${t.wash} 0%, #fff 58%)` }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: t.tone }}
      />

      <span className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 ${
            selected ? "bg-[var(--tone)] text-white" : "bg-[var(--tone-wash)] text-[var(--tone-deep)] group-hover:bg-[var(--tone)] group-hover:text-white"
          }`}
        >
          <GoalIcon goal={goal.slug} size={20} />
        </span>
        {selected ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--tone)] text-white">
            <Check size={13} strokeWidth={3} aria-hidden="true" />
          </span>
        ) : (
          <ArrowRight size={16} className="text-[var(--tone-deep)] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
        )}
      </span>

      <span>
        <span className="block text-[17px] font-bold tracking-[-0.02em] text-ink">{goal.label}</span>
        <span className="mt-1 block text-[12.5px] leading-[1.45] text-body">{goal.blurb}</span>
      </span>

      {count && (
        <span className="tnum mt-auto block border-t border-[var(--tone-wash)] pt-3 text-[12.5px] leading-[1.5] text-muted">
          <span className="block">
            <span className="font-semibold text-ink">{count.total}</span> compounds
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${count.rct ? "bg-green" : "bg-line-2"}`} />
            {count.rct ? `${count.rct} with human trials` : "no human trials yet"}
          </span>
        </span>
      )}
    </button>
  );
}
