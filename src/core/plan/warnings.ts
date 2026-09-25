/**
 * Warnings the protocol builder surfaces. Informational only — they never
 * block. The user can proceed; they just can't say they weren't told.
 */
import type { CompoundSummary } from "../schema";
import { MECHANISM_LABEL, axisOf } from "../taxonomy";
import type { Plan } from "./plan";

export type WarningKind = "same-class" | "interaction" | "already-taking" | "cycle-length";

export type PlanWarning = { kind: WarningKind; slugs: string[]; title: string; body: string };

const list = (names: string[]) =>
  names.length <= 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

export function planWarnings(plan: Plan, bySlug: Map<string, CompoundSummary>): PlanWarning[] {
  const out: PlanWarning[] = [];
  const items = plan.items.filter((i) => bySlug.has(i.slug));
  const compounds = items.map((i) => bySlug.get(i.slug)!);

  // 1. Two or more of the same mechanism class.
  const byClass = new Map<string, CompoundSummary[]>();
  for (const c of compounds) byClass.set(c.mechanismClass, [...(byClass.get(c.mechanismClass) ?? []), c]);
  for (const [cls, group] of byClass) {
    if (group.length < 2) continue;
    const label = MECHANISM_LABEL[cls] ?? `the same mechanism class (${cls})`;
    out.push({
      kind: "same-class",
      slugs: group.map((c) => c.slug),
      title: `${list(group.map((c) => c.name))} work the same way`,
      body: `They are ${group.length === 2 ? "both" : "all"} ${label}. Two from one class hit the same receptor, so side effects add up faster than any benefit — and the published protocols we cite don't combine them.`,
    });
  }

  // 2. Different classes on the same axis.
  const seen = new Set<string>();
  for (const a of compounds) {
    for (const b of compounds) {
      if (a === b || a.mechanismClass === b.mechanismClass) continue;
      if (!a.interactsWith.includes(b.slug)) continue;
      const key = [a.slug, b.slug].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const axis = axisOf(a.mechanismClass)?.name ?? "an overlapping mechanism";
      out.push({
        kind: "interaction",
        slugs: [a.slug, b.slug],
        title: `${a.name} and ${b.name} act on the same system`,
        body: `Both work through ${axis}. Some protocols pair them on purpose; either way the effects — and the side effects — compound, so watch the relevant markers.`,
      });
    }
  }

  // 3. Something the user said they already take.
  for (const c of compounds) {
    if (!plan.currentlyTaking.includes(c.slug)) continue;
    out.push({
      kind: "already-taking",
      slugs: [c.slug],
      title: `You said you're already taking ${c.name}`,
      body: "Adding it here schedules a second course on top of the first. If this plan replaces what you're on, you can ignore this.",
    });
  }

  // 4. Longer than the longest published protocol we cite.
  for (const item of items) {
    const c = bySlug.get(item.slug)!;
    const published = c.dosing.source ? c.dosing.typicalCycleWeeks : null;
    const planned = item.cycleWeeks * item.repeats;
    if (!published || planned <= published) continue;
    out.push({
      kind: "cycle-length",
      slugs: [c.slug],
      title: `${c.name} runs longer than the published protocols`,
      body: `Your plan has ${planned} weeks on ${c.name}; the longest protocol we cite ran ${published} weeks. Beyond that there's no published data on what happens.`,
    });
  }

  return out;
}
