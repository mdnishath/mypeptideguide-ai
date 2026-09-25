"use client";

import { useRouter } from "next/navigation";
import type { GoalSlug } from "@/core/schema";
import { GOALS } from "@/core/taxonomy";
import { EMPTY_ANSWERS } from "@/core/guide/questions";
import { KEYS, writeStored } from "@/state/store";
import { GoalIcon } from "@/design/goalIcon";

/**
 * The guide's first question, on the homepage. Picking a goal starts a fresh
 * guide with that answer filled in and lands on question two.
 */
export default function GoalPicker() {
  const router = useRouter();
  const start = (goal: GoalSlug) => {
    writeStored(KEYS.guide, { answers: { ...EMPTY_ANSWERS, primaryGoal: goal }, step: 1 });
    router.push("/guide");
  };

  return (
    <div role="group" aria-label="What are you mainly looking into?" className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-5">
      {GOALS.map((g) => (
        <button
          key={g.slug}
          type="button"
          onClick={() => start(g.slug)}
          className="group flex cursor-pointer flex-col items-start gap-3 bg-paper px-4 py-5 text-left transition-colors hover:bg-blue-wash focus-visible:bg-blue-wash sm:px-5 sm:py-6"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors group-hover:border-blue group-hover:text-blue-deep">
            <GoalIcon goal={g.slug} />
          </span>
          <span>
            <span className="block text-[15px] font-medium text-ink">{g.label}</span>
            <span className="mt-0.5 block text-[12px] leading-[1.4] text-muted">{g.blurb}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
