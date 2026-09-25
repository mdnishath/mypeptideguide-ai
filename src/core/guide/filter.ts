/**
 * Answers → shortlist. Pure predicate filters and a sort over the static
 * dataset: no API, no scoring model, no AI.
 *
 * OWNER: Andrew owns the answer-to-compound mapping. The rules below are the
 * working version the brief describes; each exclusion carries the plain-English
 * reason shown in "what we ruled out and why".
 */
import type { CompoundSummary } from "../schema";
import { GRADE_RANK, INJECTED_ROUTES, ROUTE_LABEL } from "../taxonomy";
import type { GuideAnswers } from "./questions";

export type RuledOut = { compound: CompoundSummary; reasons: string[] };

export type GuideResult = {
  shortlist: CompoundSummary[];
  ruledOut: RuledOut[];
};

const nonInjected = (c: CompoundSummary) => c.route.some((r) => !INJECTED_ROUTES.includes(r));

function reasonsToExclude(c: CompoundSummary, a: GuideAnswers): string[] {
  const reasons: string[] = [];

  if (a.evidence === "human-only" && c.evidenceGrade !== "human-rct") {
    reasons.push(
      c.evidenceGrade === "animal"
        ? "Animal data only, and you asked for human trials"
        : "Anecdotal evidence only, and you asked for human trials",
    );
  }

  if (a.routeComfort === "no-injection" && !nonInjected(c)) {
    const how = c.route.map((r) => ROUTE_LABEL[r]).join(" or ");
    reasons.push(`${how} only, and you asked for no injections`);
  }

  if (a.experience === "first-time") {
    if (c.experienceLevel === "experienced") {
      reasons.push("Flagged for experienced users, and this would be your first protocol");
    }
    // Only reachable when preclinical evidence was allowed — first-timers still skip anecdotal.
    if (c.evidenceGrade === "anecdotal" && a.evidence !== "human-only") {
      reasons.push("Anecdotal evidence only — left out for a first protocol");
    }
  }

  return reasons;
}

export function runGuide(a: GuideAnswers, compounds: CompoundSummary[]): GuideResult {
  if (!a.primaryGoal) return { shortlist: [], ruledOut: [] };
  const goal = a.primaryGoal;
  const secondary = a.secondaryGoal && a.secondaryGoal !== "none" ? a.secondaryGoal : null;

  // Evidence grade first, always. Within a grade, overlap with the second goal,
  // then name — never popularity, never what we'd like someone to pick.
  const sort = (x: CompoundSummary, y: CompoundSummary) =>
    GRADE_RANK[y.evidenceGrade] - GRADE_RANK[x.evidenceGrade] ||
    Number(secondary ? y.goals.includes(secondary) : 0) - Number(secondary ? x.goals.includes(secondary) : 0) ||
    x.name.localeCompare(y.name);

  const pool = compounds.filter((c) => c.profileComplete && c.goals.includes(goal)).sort(sort);

  const shortlist: CompoundSummary[] = [];
  const ruledOut: RuledOut[] = [];
  for (const c of pool) {
    const reasons = reasonsToExclude(c, a);
    if (reasons.length) ruledOut.push({ compound: c, reasons });
    else shortlist.push(c);
  }
  return { shortlist, ruledOut };
}

/** How many more results loosening question 7 would add — for the empty state. */
export function preclinicalWouldAdd(a: GuideAnswers, compounds: CompoundSummary[]): number {
  if (a.evidence !== "human-only") return 0;
  const loosened = runGuide({ ...a, evidence: "include-preclinical" }, compounds);
  return loosened.shortlist.length - runGuide(a, compounds).shortlist.length;
}
