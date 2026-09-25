import type { DoseUnit, EvidenceGrade, Frequency, GoalSlug, Route, Timing } from "./schema";

export type Goal = {
  slug: GoalSlug;
  label: string;
  /** Indexable landing page: /peptides-for-<landing> */
  landing: string;
  icon: string;
  blurb: string;
  /** Opening paragraph on the goal landing page. */
  intro: string;
};

export const GOALS: Goal[] = [
  {
    slug: "sleep",
    label: "Sleep",
    landing: "sleep",
    icon: "moon",
    blurb: "Deeper, more restorative sleep",
    intro:
      "Most of the peptides linked to sleep don't act on sleep directly. GH secretagogues deepen slow-wave sleep as a side effect of the growth-hormone pulse they trigger, and a few older compounds were named for sleep effects that later studies struggled to reproduce. Here is what each one actually has behind it.",
  },
  {
    slug: "weight-loss",
    label: "Weight loss",
    landing: "weight-loss",
    icon: "pulse",
    blurb: "Appetite & fat metabolism",
    intro:
      "This is the category with the strongest human evidence anywhere on the site — the incretin agonists have large, long randomised trials behind them. It is also the category with the most marketing for compounds that have none. The grades below separate the two.",
  },
  {
    slug: "muscle-growth",
    label: "Muscle growth",
    landing: "muscle",
    icon: "chart",
    blurb: "Lean mass & strength",
    intro:
      "Nearly everything here works through the growth-hormone / IGF-1 axis. Raising GH is well documented; turning that into meaningful lean mass in healthy adults is much less so, and stacking several compounds on the same axis multiplies side effects faster than results.",
  },
  {
    slug: "recovery",
    label: "Recovery",
    landing: "recovery",
    icon: "shield",
    blurb: "Tissue repair & injury",
    intro:
      "The recovery peptides have some of the most enthusiastic followings and some of the thinnest human evidence. The animal results are often consistent and genuinely interesting — which is not the same as a controlled human trial, and the grades say so.",
  },
  {
    slug: "longevity",
    label: "Longevity",
    landing: "longevity",
    icon: "hourglass",
    blurb: "Healthspan & aging",
    intro:
      "Longevity claims are the hardest to test in humans, so most of the evidence here is mechanistic, animal, or from small single-program cohorts. That doesn't make the biology wrong; it does mean nobody has shown the outcomes yet.",
  },
  {
    slug: "cognitive",
    label: "Cognitive",
    landing: "cognition",
    icon: "target",
    blurb: "Focus, memory & mood",
    intro:
      "Several cognitive peptides have decades of clinical use in Russia and Eastern Europe without Western regulatory review, and a few of the most-discussed ones have never been given to humans in a published study. The evidence grade matters more here than almost anywhere.",
  },
  {
    slug: "skin-hair",
    label: "Skin & hair",
    landing: "skin-hair",
    icon: "droplet",
    blurb: "Collagen, skin & hair",
    intro:
      "The best-evidenced compounds in this category are topical cosmetics with small, real, modest results. Injected use of the same peptides mostly has no comparable data, and one popular tanning peptide carries a genuine skin-monitoring caveat.",
  },
  {
    slug: "libido",
    label: "Libido",
    landing: "libido",
    icon: "heart",
    blurb: "Arousal & sexual function",
    intro:
      "One compound here is FDA-approved with real prescribing data; the rest range from well-studied research tools to unapproved products with safety caveats. Two of them act on the same receptor, which matters if you are considering both.",
  },
  {
    slug: "immune",
    label: "Immune",
    landing: "immune",
    icon: "lotus",
    blurb: "Immune modulation",
    intro:
      "Immune peptides split cleanly into compounds approved abroad for specific indications and compounds from research programs with little independent replication. 'Immune boosting' as a general goal sits outside what any of them were tested for.",
  },
  {
    slug: "energy",
    label: "Energy",
    landing: "energy",
    icon: "sun",
    blurb: "Cellular energy & endurance",
    intro:
      "The energy category mixes metabolic drugs with strong trial data and mitochondrial compounds with strong bench interest and thin human data. The difference between those two is exactly what the evidence grade captures.",
  },
];

export const GOAL_BY_SLUG = Object.fromEntries(GOALS.map((g) => [g.slug, g])) as Record<GoalSlug, Goal>;

export const CLASS_LABEL: Record<string, string> = {
  "tissue-repair": "Tissue repair",
  "immune-defense": "Immune & defense",
  "metabolic-glp1": "Metabolic & GLP-1",
  "endocrine-gh": "Endocrine & GH",
  "muscle-performance": "Muscle & performance",
  "skin-cosmetic": "Skin & cosmetic",
  "cellular-longevity": "Cellular & longevity",
  "neural-cognitive": "Neural & cognitive",
  "sleep-stress": "Sleep & stress",
  "sexual-health": "Sexual health",
};

/** Human names for mechanism classes, used in the same-class warning. */
export const MECHANISM_LABEL: Record<string, string> = {
  ghrp: "ghrelin-receptor agonists (GHRPs)",
  ghrh: "GHRH analogues",
  "glp1-agonist": "GLP-1 receptor agonists",
  "melanocortin-agonist": "melanocortin-receptor agonists",
  "thymosin-beta-4": "thymosin β4 forms",
  "mitochondrial-derived-peptide": "mitochondrial-derived peptides",
  "snare-inhibitor": "SNARE-inhibiting cosmetic peptides",
  bioregulator: "peptide bioregulators",
  "thymic-bioregulator": "thymic bioregulators",
};

/**
 * Different mechanism classes that act on the same physiological axis — the
 * basis of `interactsWith` and the "overlapping mechanisms" warning.
 */
export const AXES: { name: string; classes: string[] }[] = [
  { name: "the GH / IGF-1 axis", classes: ["ghrp", "ghrh", "igf1"] },
  { name: "appetite and incretin signalling", classes: ["glp1-agonist", "amylin-analogue", "monoamine-reuptake"] },
  { name: "the reproductive (HPG) axis", classes: ["kisspeptin", "gnrh"] },
];

export const axisOf = (mechanismClass: string) => AXES.find((a) => a.classes.includes(mechanismClass));

export const GRADE_LABEL: Record<EvidenceGrade, string> = {
  "human-rct": "Human RCT",
  animal: "Animal data only",
  anecdotal: "Anecdotal",
};

/** Higher sorts first. Results are always sorted by this — never by popularity. */
export const GRADE_RANK: Record<EvidenceGrade, number> = { "human-rct": 3, animal: 2, anecdotal: 1 };

export const ROUTE_LABEL: Record<Route, string> = {
  subq: "SubQ injection",
  im: "IM injection",
  iv: "IV",
  oral: "Oral",
  nasal: "Nasal",
  topical: "Topical",
};

export const INJECTED_ROUTES: Route[] = ["subq", "im", "iv"];

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: "Daily",
  eod: "Every other day",
  "2x-week": "Twice a week",
  weekly: "Weekly",
  "5-on-2-off": "5 days on, 2 off",
  "as-needed": "As needed",
};

export const TIMING_LABEL: Record<Timing, string> = {
  any: "Any time",
  morning: "Morning",
  "pre-bed": "Before bed",
};

/** Default clock time for a timing preference. */
export const TIMING_CLOCK: Record<Timing, string> = { any: "09:00", morning: "08:00", "pre-bed": "21:30" };

export const UNIT_LABEL: Record<DoseUnit, string> = { mcg: "mcg", mg: "mg" };
