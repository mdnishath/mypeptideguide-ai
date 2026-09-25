"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { GoalSlug } from "@/core/schema";
import { GOALS } from "@/core/taxonomy";
import type { Option } from "@/core/guide/questions";
import GoalTile from "@/design/GoalTile";

/**
 * A vertical list of options, one per row, with keyboard numerals. Single
 * select by default. Rows are separated by hairlines, not boxed.
 */
export function OptionRows<V extends string>({
  options,
  value,
  onPick,
  label,
}: {
  options: Option<V>[];
  value: V | null;
  onPick: (v: V) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="border-t border-line">
      {options.map((o, i) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(o.value)}
            className={`group flex w-full cursor-pointer items-center gap-5 border-b border-line py-5 text-left transition-colors hover:bg-paper-2 ${on ? "bg-blue-wash/60" : ""}`}
          >
            <span className={`w-8 shrink-0 pl-2 name text-[20px] ${on ? "text-blue-deep" : "text-ghost group-hover:text-muted"}`}>
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-medium text-ink sm:text-[19px]">{o.label}</span>
              {o.sub && <span className="mt-0.5 block text-[13.5px] leading-[1.5] text-body">{o.sub}</span>}
            </span>
            <span
              aria-hidden="true"
              className={`mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                on ? "border-blue bg-blue text-white" : "border-line-2 text-transparent group-hover:border-ink"
              }`}
            >
              <Check size={15} strokeWidth={2.5} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** The ten goals as a grid of tiles with a selected state. */
export function GoalGrid({
  value,
  exclude,
  onPick,
  label,
}: {
  value: GoalSlug | "none" | null;
  exclude?: GoalSlug | null;
  onPick: (g: GoalSlug) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {GOALS.filter((g) => g.slug !== exclude).map((g) => (
        <GoalTile key={g.slug} goal={g} role="radio" selected={value === g.slug} onClick={() => onPick(g.slug)} />
      ))}
    </div>
  );
}

/** A large checkbox row (Q8 acknowledgements). */
export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 border-b border-line py-5 transition-colors hover:bg-paper-2 ${checked ? "bg-blue-wash/60" : ""}`}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span
        aria-hidden="true"
        className={`ml-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked ? "border-blue bg-blue text-white" : "border-line-2 bg-paper"
        }`}
      >
        {checked && <Check size={14} strokeWidth={2.5} />}
      </span>
      <span className="pr-2 text-[15px] leading-[1.55] text-ink">{children}</span>
    </label>
  );
}
