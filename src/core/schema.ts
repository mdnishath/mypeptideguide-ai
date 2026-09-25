/**
 * The compound data model from the v1 brief. One JSON file per compound in
 * content/compounds/ — everything (guide filters, results sort, goal pages,
 * protocol defaults, calendar) reads from it.
 */

export const GOAL_SLUGS = [
  "sleep",
  "weight-loss",
  "muscle-growth",
  "recovery",
  "longevity",
  "cognitive",
  "skin-hair",
  "libido",
  "immune",
  "energy",
] as const;
export type GoalSlug = (typeof GOAL_SLUGS)[number];

export const EVIDENCE_GRADES = ["human-rct", "animal", "anecdotal"] as const;
export type EvidenceGrade = (typeof EVIDENCE_GRADES)[number];

export const ROUTES = ["subq", "im", "iv", "oral", "nasal", "topical"] as const;
export type Route = (typeof ROUTES)[number];

export const FREQUENCIES = ["daily", "eod", "2x-week", "weekly", "5-on-2-off", "as-needed"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const TIMINGS = ["any", "morning", "pre-bed"] as const;
export type Timing = (typeof TIMINGS)[number];

export const DOSE_UNITS = ["mcg", "mg"] as const;
export type DoseUnit = (typeof DOSE_UNITS)[number];

export type Bullet = ["ok" | "wt" | "bad", string];

export type TitrationStep = { week: number; dose: number };

export type Dosing = {
  /** Only ever set together with `source`. If we can't cite it, we don't show a number. */
  reportedRange: { min: number; max: number; unit: DoseUnit } | null;
  frequency: Frequency;
  timing: Timing;
  /** Length of the published protocol — drives the "longer than reported" warning. */
  typicalCycleWeeks: number | null;
  titration: TitrationStep[] | null;
  source: string | null;
  /** The prototype's uncited figure. Never rendered; kept for the editor. */
  conventionNote: string | null;
};

/** Everything except long-form profile copy — safe to hand to client components. */
export type CompoundSummary = {
  slug: string;
  name: string;
  subtitle: string;
  class: string;
  mechanismClass: string;
  goals: GoalSlug[];
  route: Route[];
  evidenceGrade: EvidenceGrade;
  citationCount: number | null;
  reviewedOn: string | null;
  summary: string;
  caveat: string;
  dosing: Dosing;
  halfLifeHours: number | null;
  halfLifeLabel: string | null;
  interactsWith: string[];
  experienceLevel: "any" | "experienced";
  profileComplete: boolean;
};

export type CompoundProfile = {
  what: string;
  how: string | null;
  research: string | null;
  dosage: string | null;
  researchBullets: Bullet[] | null;
  safety: Bullet[];
  faq: [string, string][];
  refs: string[];
};

export type CompoundRecord = CompoundSummary & { profile: CompoundProfile };

export type Guide = {
  slug: string;
  tag: string;
  title: string;
  dek: string;
  readMinutes: number;
  ready: boolean;
  sections: { heading: string; body: string }[];
};

export type GlossaryTerm = { term: string; definition: string };
