/**
 * The eight guide questions.
 *
 * OWNER: Andrew writes the final wording here. The wording below is a working
 * draft so the flow can be tested end to end. Option `value`s are what the
 * filter logic in ./filter.ts reads — change labels freely, but change a value
 * only together with the matching branch in filter.ts.
 */
import type { GoalSlug } from "../schema";

export type Experience = "first-time" | "done-a-cycle" | "ongoing";
export type RouteComfort = "injection-ok" | "no-injection";
export type CyclePref = "short" | "12-weeks" | "ongoing";
export type EvidencePref = "human-only" | "include-preclinical";

export type GuideAnswers = {
  primaryGoal: GoalSlug | null;
  /** "none" = explicitly skipped. */
  secondaryGoal: GoalSlug | "none" | null;
  experience: Experience | null;
  routeComfort: RouteComfort | null;
  /** Slugs from the library; [] with `nothingCurrent` true means "nothing". */
  currentlyTaking: string[];
  nothingCurrent: boolean;
  cycle: CyclePref | null;
  /** Defaults to human-only: the honest default, and the brand in one control. */
  evidence: EvidencePref;
  adult: boolean;
  notAdvice: boolean;
};

export const EMPTY_ANSWERS: GuideAnswers = {
  primaryGoal: null,
  secondaryGoal: null,
  experience: null,
  routeComfort: null,
  currentlyTaking: [],
  nothingCurrent: false,
  cycle: null,
  evidence: "human-only",
  adult: false,
  notAdvice: false,
};

export type QuestionId =
  | "primaryGoal"
  | "secondaryGoal"
  | "experience"
  | "routeComfort"
  | "currentlyTaking"
  | "cycle"
  | "evidence"
  | "acknowledge";

export type Option<V extends string = string> = { value: V; label: string; sub?: string };

export type Question = {
  id: QuestionId;
  eyebrow: string;
  title: string;
  help?: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "primaryGoal",
    eyebrow: "Your goal",
    title: "What are you mainly looking into?",
    help: "This is the main filter. You can add a second goal next.",
  },
  {
    id: "secondaryGoal",
    eyebrow: "Second goal · optional",
    title: "Anything else you'd like it to help with?",
    help: "Compounds that also cover this goal sort higher within each evidence grade.",
  },
  {
    id: "experience",
    eyebrow: "Experience",
    title: "Have you run a peptide protocol before?",
    help: "First-timers see fewer options — only the better-evidenced ones.",
  },
  {
    id: "routeComfort",
    eyebrow: "Route",
    title: "Are you comfortable with injections?",
  },
  {
    id: "currentlyTaking",
    eyebrow: "What you're taking",
    title: "Are you taking any of these already?",
    help: "Used only to warn you about doubling up or stacking the same mechanism. It never leaves your browser.",
  },
  {
    id: "cycle",
    eyebrow: "Cycle length",
    title: "How long a run are you planning?",
    help: "This sets the length of your calendar. You can change it per compound later.",
  },
  {
    id: "evidence",
    eyebrow: "Evidence",
    title: "What evidence do you want behind a compound?",
    help: "“Human trials only” is the default because it's the honest one. Preclinical results are real but often don't carry over to people.",
  },
  {
    id: "acknowledge",
    eyebrow: "Before your results",
    title: "Two things to confirm",
  },
];

export const EXPERIENCE_OPTIONS: Option<Experience>[] = [
  { value: "first-time", label: "This would be my first", sub: "Only well-evidenced options, no experienced-only compounds" },
  { value: "done-a-cycle", label: "I've done a cycle before" },
  { value: "ongoing", label: "I'm running one now" },
];

export const ROUTE_OPTIONS: Option<RouteComfort>[] = [
  { value: "injection-ok", label: "Yes, injections are fine" },
  { value: "no-injection", label: "No — oral, nasal or topical only" },
];

export const CYCLE_OPTIONS: Option<CyclePref>[] = [
  { value: "short", label: "A short trial", sub: "About 4 weeks" },
  { value: "12-weeks", label: "Around 12 weeks" },
  { value: "ongoing", label: "Ongoing", sub: "Your calendar starts with 26 weeks; extend it any time" },
];

export const EVIDENCE_OPTIONS: Option<EvidencePref>[] = [
  {
    value: "human-only",
    label: "Human trials only",
    sub: "Compounds with controlled human studies behind them",
  },
  {
    value: "include-preclinical",
    label: "Include preclinical and anecdotal",
    sub: "Adds animal-only and forum-level evidence, clearly labelled",
  },
];

/** Default calendar length, in weeks, for each cycle answer. */
export const CYCLE_WEEKS: Record<CyclePref, number> = { short: 4, "12-weeks": 12, ongoing: 26 };

/** Whether a question has a usable answer, so Next can be enabled. */
export function isAnswered(id: QuestionId, a: GuideAnswers): boolean {
  switch (id) {
    case "primaryGoal":
      return a.primaryGoal !== null;
    case "secondaryGoal":
      return a.secondaryGoal !== null;
    case "experience":
      return a.experience !== null;
    case "routeComfort":
      return a.routeComfort !== null;
    case "currentlyTaking":
      return a.nothingCurrent || a.currentlyTaking.length > 0;
    case "cycle":
      return a.cycle !== null;
    case "evidence":
      return true;
    case "acknowledge":
      return a.adult && a.notAdvice;
  }
}

export const isComplete = (a: GuideAnswers) => QUESTIONS.every((q) => isAnswered(q.id, a));
