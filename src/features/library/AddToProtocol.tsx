"use client";

import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import type { CompoundSummary } from "@/core/schema";
import { defaultItem, emptyPlan, parsePlan, type Plan } from "@/core/plan/plan";
import { KEYS, useStored } from "@/state/store";

/** Adds one compound to the saved plan (creating it if needed) and opens the builder. */
export default function AddToProtocol({ compound }: { compound: CompoundSummary }) {
  const router = useRouter();
  const [raw, setRaw, hydrated] = useStored<unknown>(KEYS.plan, null);
  const plan: Plan = parsePlan(raw) ?? emptyPlan();
  const already = plan.items.some((i) => i.slug === compound.slug);

  return (
    <button
      type="button"
      disabled={!hydrated}
      onClick={() => {
        if (!already) setRaw({ ...plan, items: [...plan.items, defaultItem(compound)] });
        router.push("/protocol");
      }}
      className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[14px] font-medium transition-colors disabled:opacity-40 ${
        already ? "bg-ink text-paper hover:bg-blue" : "border border-line-2 bg-paper text-ink hover:border-ink"
      }`}
    >
      {already ? <Check size={16} strokeWidth={2.5} aria-hidden="true" /> : <Plus size={16} strokeWidth={2.5} aria-hidden="true" />}
      {already ? "In your protocol, open it" : "Add to my protocol"}
    </button>
  );
}
