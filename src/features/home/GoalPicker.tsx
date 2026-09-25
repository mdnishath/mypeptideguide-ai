"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
    <div role="group" aria-label="What are you mainly looking into?" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {GOALS.map((g) => (
        <button
          key={g.slug}
          type="button"
          onClick={() => start(g.slug)}
          className="tile group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-line bg-paper/80 px-5 py-5 text-left backdrop-blur hover:border-blue/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-2 text-ink transition-colors group-hover:bg-blue group-hover:text-white">
            <GoalIcon goal={g.slug} size={19} />
          </span>
          <span className="w-full">
            <span className="block text-[15px] font-semibold tracking-[-0.01em] text-ink">{g.label}</span>
            <span className="mt-1 block text-[12px] leading-[1.45] text-muted">{g.blurb}</span>
          </span>
          <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-blue-deep opacity-0 transition-opacity group-hover:opacity-100">
            Start <ArrowRight size={13} aria-hidden="true" />
          </span>
        </button>
      ))}
    </div>
  );
}
