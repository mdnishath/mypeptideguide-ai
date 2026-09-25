"use client";

import { useRouter } from "next/navigation";
import type { GoalSlug } from "@/core/schema";
import { GOALS } from "@/core/taxonomy";
import { EMPTY_ANSWERS } from "@/core/guide/questions";
import { KEYS, writeStored } from "@/state/store";
import GoalTile, { type GoalCount } from "@/design/GoalTile";

/**
 * The guide's first question, on the homepage. Picking a goal starts a fresh
 * guide with that answer filled in and lands on question two.
 */
export default function GoalPicker({ counts }: { counts: Record<GoalSlug, GoalCount> }) {
  const router = useRouter();
  const start = (goal: GoalSlug) => {
    writeStored(KEYS.guide, { answers: { ...EMPTY_ANSWERS, primaryGoal: goal }, step: 1 });
    router.push("/guide");
  };

  return (
    <div role="group" aria-label="What are you mainly looking into?" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {GOALS.map((g) => (
        <GoalTile key={g.slug} goal={g} count={counts[g.slug]} onClick={() => start(g.slug)} />
      ))}
    </div>
  );
}
