/**
 * ONE-TIME migration: prototype data (scripts/prototype-data.ts) → content/*.json
 * in the v1 brief's compound schema.
 *
 *   node scripts/migrate-prototype.ts
 *
 * After this runs, content/ is the source of truth and is edited by hand. Do not
 * re-run it over edited content — it overwrites. Kept for provenance: every value
 * below is either copied from the prototype or listed in ENRICH with its basis.
 *
 * Editorial status of what this script adds (see CONTENT-STATUS.md):
 *   - dosing.reportedRange / source / titration / typicalCycleWeeks are set ONLY for
 *     compounds with a regulatory label or a named trial. Dev-drafted — verify.
 *   - caveat lines are drafted from the prototype's own descriptions. Verify.
 *   - mechanismClass / route / experienceLevel are pharmacology classifications. Verify.
 *   - reviewedOn is null everywhere: nothing has been editorially reviewed yet.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BULLETS, DB, EXTRA, FACTS, GLOSS, GUIDES, GUIDE_LIST, SAFE_FB } from "./prototype-data.ts";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "content", "compounds");

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const GOAL_SLUG: Record<string, string> = {
  Sleep: "sleep",
  "Weight loss": "weight-loss",
  "Muscle growth": "muscle-growth",
  Recovery: "recovery",
  Longevity: "longevity",
  Cognitive: "cognitive",
  "Skin & hair": "skin-hair",
  Libido: "libido",
  Immune: "immune",
  Energy: "energy",
};

const CLASS_SLUG: Record<string, string> = {
  "Tissue repair": "tissue-repair",
  "Immune & defense": "immune-defense",
  "Metabolic & GLP-1": "metabolic-glp1",
  "Endocrine & GH": "endocrine-gh",
  "Muscle & performance": "muscle-performance",
  "Skin & cosmetic": "skin-cosmetic",
  "Cellular & longevity": "cellular-longevity",
  "Neural & cognitive": "neural-cognitive",
  "Sleep & stress": "sleep-stress",
  "Sexual health": "sexual-health",
};

const GRADE = { rct: "human-rct", animal: "animal", anec: "anecdotal" } as const;

/** Prototype "Administration" strings → route enums. */
const ROUTE_MAP: Record<string, string[]> = {
  SubQ: ["subq"],
  Oral: ["oral"],
  "SubQ · oral": ["subq", "oral"],
  Nasal: ["nasal"],
  "Topical · SubQ": ["topical", "subq"],
  "SubQ · IM": ["subq", "im"],
  Topical: ["topical"],
  "IV · SubQ": ["iv", "subq"],
  "IM · IV": ["im", "iv"],
};

/** Prototype half-life strings → hours, where the string is a single figure. */
function halfLifeHours(label: string): number | null {
  const m = label.match(/^~\s*(\d+(?:\.\d+)?)(?:–(\d+(?:\.\d+)?))?\s*(min|hour|hours|day|days)$/);
  if (!m) return label === "~ weekly" ? 168 : null;
  const lo = +m[1];
  const hi = m[2] ? +m[2] : lo;
  const mid = (lo + hi) / 2;
  const unit = m[3];
  const h = unit === "min" ? mid / 60 : unit.startsWith("day") ? mid * 24 : mid;
  return Math.round(h * 100) / 100;
}

type Titration = { week: number; dose: number }[];
type Enrich = {
  mechanismClass: string;
  route?: string[]; // only where the prototype had no administration fact
  experienceLevel?: "experienced";
  frequency?: string;
  timing?: string;
  caveat?: string;
  cited?: {
    min: number;
    max: number;
    unit: "mcg" | "mg";
    frequency: string;
    typicalCycleWeeks: number | null;
    titration?: Titration;
    source: string;
  };
};

const ENRICH: Record<string, Enrich> = {
  "BPC-157": {
    mechanismClass: "bpc",
    caveat: "Every consistent result is in rodents; claims of human tendon or gut healing run far ahead of the data.",
  },
  "TB-500": {
    mechanismClass: "thymosin-beta-4",
    frequency: "2x-week",
    caveat: "A synthetic fragment — the human exposure data belongs to full-length Tβ4, not to TB-500 itself.",
  },
  "Thymosin Beta-4": {
    mechanismClass: "thymosin-beta-4",
    route: ["subq"],
    caveat: "Human trials cover eye and cardiac indications, not the whole-body recovery it is logged for.",
  },
  KPV: {
    mechanismClass: "kpv",
    route: ["subq", "oral"],
    caveat: "Studied almost entirely in gut-inflammation animal models; no controlled human data.",
  },
  "LL-37": {
    mechanismClass: "cathelicidin",
    route: ["subq", "topical"],
    caveat: "Clinical trials were for chronic wounds; systemic self-use is outside anything tested.",
  },
  "GLP-1 (S)": {
    mechanismClass: "glp1-agonist",
    caveat: "Nausea and GI effects are common, which is why every schedule titrates slowly; weight tends to return after stopping.",
    cited: {
      min: 0.25,
      max: 2.4,
      unit: "mg",
      frequency: "weekly",
      typicalCycleWeeks: 68,
      titration: [
        { week: 0, dose: 0.25 },
        { week: 4, dose: 0.5 },
        { week: 8, dose: 1 },
        { week: 12, dose: 1.7 },
        { week: 16, dose: 2.4 },
      ],
      source:
        "Wegovy (semaglutide) US Prescribing Information — dose-escalation schedule; Wilding JPH et al. — STEP 1 · N Engl J Med, 2021",
    },
  },
  "GLP-1/GIP (T)": {
    mechanismClass: "glp1-agonist",
    caveat: "GI effects are dose-dependent and front-loaded; the trial populations had obesity, not general body-composition goals.",
    cited: {
      min: 2.5,
      max: 15,
      unit: "mg",
      frequency: "weekly",
      typicalCycleWeeks: 72,
      titration: [
        { week: 0, dose: 2.5 },
        { week: 4, dose: 5 },
        { week: 8, dose: 7.5 },
        { week: 12, dose: 10 },
        { week: 16, dose: 12.5 },
        { week: 20, dose: 15 },
      ],
      source:
        "Zepbound (tirzepatide) US Prescribing Information — dose-escalation schedule; Jastreboff AM et al. — SURMOUNT-1 · N Engl J Med, 2022",
    },
  },
  Retatrutide: {
    mechanismClass: "glp1-agonist",
    experienceLevel: "experienced",
    caveat: "Phase 2 data only — not approved anywhere, and anything sold under the name is unregulated.",
    cited: {
      min: 1,
      max: 12,
      unit: "mg",
      frequency: "weekly",
      typicalCycleWeeks: 48,
      source: "Jastreboff AM et al. — Triple-hormone-receptor agonist retatrutide for obesity: a phase 2 trial · N Engl J Med, 2023",
    },
  },
  Cagrilintide: {
    mechanismClass: "amylin-analogue",
    caveat: "Most of its data is in combination with a GLP-1; on its own it has one phase 2 trial.",
    cited: {
      min: 0.3,
      max: 4.5,
      unit: "mg",
      frequency: "weekly",
      typicalCycleWeeks: 26,
      source:
        "Lau DCW et al. — Once-weekly cagrilintide for weight management: a dose-finding phase 2 trial · Lancet, 2021",
    },
  },
  Survodutide: {
    mechanismClass: "glp1-agonist",
    caveat: "Late-stage but not approved; GI side effects led a notable share of trial participants to stop.",
    cited: {
      min: 0.6,
      max: 4.8,
      unit: "mg",
      frequency: "weekly",
      typicalCycleWeeks: 46,
      source:
        "le Roux CW et al. — Survodutide for obesity: a randomised, dose-finding phase 2 trial · Lancet Diabetes Endocrinol, 2024",
    },
  },
  Tesofensine: {
    mechanismClass: "monoamine-reuptake",
    route: undefined,
    experienceLevel: "experienced",
    timing: "morning",
    caveat: "A stimulant-class drug: raised heart rate and blood pressure, insomnia and mood effects came with the weight loss.",
    cited: {
      min: 0.25,
      max: 1,
      unit: "mg",
      frequency: "daily",
      typicalCycleWeeks: 24,
      source: "Astrup A et al. — Effect of tesofensine on bodyweight loss in obese patients: a phase 2 trial · Lancet, 2008",
    },
  },
  "5-Amino-1MQ": {
    mechanismClass: "nnmt-inhibitor",
    caveat: "Fat-loss results are in mice; there is no published human evidence at all.",
  },
  "AOD-9604": {
    mechanismClass: "gh-fragment",
    caveat: "Its own human trials showed little separation from placebo on weight.",
  },
  Ipamorelin: {
    mechanismClass: "ghrp",
    timing: "pre-bed",
    caveat: "The selectivity holds up mechanistically; outcome trials for body composition, recovery or sleep were never run.",
  },
  "MK-677": {
    mechanismClass: "ghrp",
    timing: "pre-bed",
    caveat: "Appetite, water retention and fasting-glucose drift are consistent; one elderly trial was stopped over a heart-failure signal.",
    cited: {
      min: 10,
      max: 25,
      unit: "mg",
      frequency: "daily",
      typicalCycleWeeks: 52,
      source:
        "Chapman IM et al. — MK-677 in healthy elderly subjects · J Clin Endocrinol Metab, 1996; Nass R et al. — Oral ghrelin mimetic in older adults · Ann Intern Med, 2008",
    },
  },
  "CJC-1295": {
    mechanismClass: "ghrh",
    timing: "pre-bed",
    caveat: "DAC and no-DAC versions behave very differently; the human data is for the DAC form only.",
  },
  Sermorelin: {
    mechanismClass: "ghrh",
    timing: "pre-bed",
    caveat: "Its long-term safety record is pediatric; adult anti-aging use sits outside it.",
  },
  Tesamorelin: {
    mechanismClass: "ghrh",
    caveat: "Approved for HIV-associated visceral fat only; body-composition use in other adults is off-label.",
    cited: {
      min: 1.4,
      max: 2,
      unit: "mg",
      frequency: "daily",
      typicalCycleWeeks: 26,
      source:
        "Egrifta / Egrifta SV (tesamorelin) US Prescribing Information; Falutz J et al. · N Engl J Med, 2007",
    },
  },
  "GHRP-2": {
    mechanismClass: "ghrp",
    timing: "pre-bed",
    caveat: "More GH per dose than ipamorelin — and more cortisol, prolactin and hunger with it.",
  },
  "GHRP-6": {
    mechanismClass: "ghrp",
    timing: "pre-bed",
    experienceLevel: "experienced",
    caveat: "The appetite surge is strong enough to be the main thing people notice.",
  },
  Hexarelin: {
    mechanismClass: "ghrp", route: ["subq"],
    experienceLevel: "experienced",
    caveat: "Receptors desensitise quickly under continuous use.",
  },
  "IGF-1 LR3": {
    mechanismClass: "igf1",
    experienceLevel: "experienced",
    caveat: "Built for cell culture; no human studies, and hypoglycaemia is a real acute risk.",
  },
  "GHK-Cu": {
    mechanismClass: "copper-peptide",
    caveat: "The clinical data is topical and cosmetic; injected use has no comparable evidence.",
  },
  Matrixyl: {
    mechanismClass: "signal-peptide",
    caveat: "Cosmetic-grade evidence — small studies, modest effects on fine lines.",
  },
  "Melanotan II": {
    mechanismClass: "melanocortin-agonist",
    experienceLevel: "experienced",
    caveat: "Unapproved; new or changing moles and nausea are documented, and it overlaps PT-141's receptor.",
  },
  Argireline: {
    mechanismClass: "snare-inhibitor",
    caveat: "Small controlled studies on expression lines; the effect is real but modest.",
  },
  "Snap-8": { mechanismClass: "snare-inhibitor", route: ["topical"], },
  "PTD-DBM": { mechanismClass: "wnt-modulator", route: ["topical"], },
  "Zinc-Thymulin": { mechanismClass: "thymulin", route: ["topical"], },
  Epithalon: {
    mechanismClass: "bioregulator",
    caveat: "The human data comes from one research program and has not been independently replicated.",
  },
  "MOTS-c": {
    mechanismClass: "mitochondrial-derived-peptide",
    route: ["subq"],
    caveat: "Strong bench interest; human data is thin and mostly observational.",
  },
  "SS-31": {
    mechanismClass: "cardiolipin-targeting",
    route: ["subq"],
    caveat: "Trialled in rare mitochondrial disease and heart failure — not in healthy adults.",
  },
  Semax: {
    mechanismClass: "semax",
    caveat: "Decades of Russian clinical use, but no Western regulatory review or modern RCTs.",
  },
  Selank: {
    mechanismClass: "selank",
    caveat: "Approved in Russia; untested in Western randomised trials.",
  },
  Cerebrolysin: {
    mechanismClass: "neurotrophic-mixture",
    experienceLevel: "experienced",
    caveat: "Trials are in stroke and dementia patients with heterogeneous results; it is an IV/IM clinical product.",
  },
  Noopept: {
    mechanismClass: "noopept",
    caveat: "Small human studies; most of its reputation comes from forums.",
  },
  P21: { mechanismClass: "cntf-derived", route: ["subq"], },
  Dihexa: {
    mechanismClass: "hgf-met",
    route: ["oral", "topical"],
    experienceLevel: "experienced",
    caveat: "Potent in animals with essentially no human safety data — and its growth-factor mechanism carries a theoretical tumour caution.",
  },
  DSIP: {
    mechanismClass: "dsip",
    timing: "pre-bed",
    caveat: "Its receptor is still unknown and later studies often failed to reproduce the sleep effect.",
  },
  "PT-141": {
    mechanismClass: "melanocortin-agonist",
    caveat: "Approved for premenopausal women with low desire; nausea and transient blood-pressure rise are common.",
    cited: {
      min: 1.75,
      max: 1.75,
      unit: "mg",
      frequency: "as-needed",
      typicalCycleWeeks: null,
      source:
        "Vyleesi (bremelanotide) US Prescribing Information, 2019 — no more than one dose per 24 hours or eight per month",
    },
  },
  "Kisspeptin-10": {
    mechanismClass: "kisspeptin",
    experienceLevel: "experienced",
    caveat: "Well studied as a research tool; there is no mapped protocol for self-use.",
  },
  Gonadorelin: {
    mechanismClass: "gnrh",
    caveat: "Clinical use is diagnostic or fertility-specific; use alongside TRT is clinic practice, not trial-backed.",
  },
  Oxytocin: {
    mechanismClass: "oxytocin",
    caveat: "Intranasal social-behaviour findings have replicated poorly.",
  },
  "Thymosin Alpha-1": {
    mechanismClass: "thymosin-alpha",
    caveat: "Approved outside the US for hepatitis B and as an immune adjunct; general immune-boosting use is off-label.",
    cited: {
      min: 1.6,
      max: 1.6,
      unit: "mg",
      frequency: "2x-week",
      typicalCycleWeeks: 26,
      source: "Zadaxin (thymalfasin) product information — 1.6 mg twice weekly for 6 months in chronic hepatitis B",
    },
  },
  Thymalin: { mechanismClass: "thymic-bioregulator", route: ["subq"], },
  Thymogen: { mechanismClass: "thymic-bioregulator", route: ["nasal"], },
  VIP: { mechanismClass: "vip", route: ["nasal"], },
  Humanin: { mechanismClass: "mitochondrial-derived-peptide", route: ["subq"], },
  "Follistatin 344": { mechanismClass: "myostatin-inhibitor", route: ["subq"], experienceLevel: "experienced" },
  "FOXO4-DRI": { mechanismClass: "senolytic", route: ["subq"], experienceLevel: "experienced" },
  "L-Glutathione": { mechanismClass: "glutathione", route: ["oral", "iv"], },
  Carnosine: { mechanismClass: "carnosine", route: ["oral"], },
  "NAD+": {
    mechanismClass: "nad",
    caveat: "Not a peptide; the biology is central, but human benefit from infusions or injections is early and mixed.",
  },
  Pinealon: { mechanismClass: "bioregulator", route: ["oral"], },
};

/**
 * Mechanisms that act on the same physiological axis without being the same class.
 * Drives `interactsWith` (the "overlapping mechanisms" warning). Same-class pairs are
 * caught separately via mechanismClass, so they are not repeated here.
 */
const AXES: { name: string; classes: string[] }[] = [
  { name: "GH / IGF-1 axis", classes: ["ghrp", "ghrh", "igf1"] },
  { name: "appetite and incretin signalling", classes: ["glp1-agonist", "amylin-analogue", "monoamine-reuptake"] },
  { name: "reproductive (HPG) axis", classes: ["kisspeptin", "gnrh"] },
];

const GENERIC_CAVEAT = {
  "human-rct": "Trial data covers the studied indication; use outside it goes beyond the evidence.",
  animal: "The headline results are from animal models — there is no controlled human data.",
  anecdotal: "Published human evidence is minimal, dated or unreplicated.",
} as const;

mkdirSync(OUT, { recursive: true });

const records = DB.map((r) => {
  const [name, alias, category, description, goals, grade, full] = r;
  const e = ENRICH[name];
  if (!e) throw new Error(`No ENRICH entry for ${name}`);
  const facts = FACTS[name];
  const route = e.route ?? (facts ? ROUTE_MAP[facts[2]] : undefined);
  if (!route) throw new Error(`No route for ${name}`);
  const evidenceGrade = GRADE[grade];
  const guide = GUIDES[name];

  const profile = {
    what: guide?.what ?? description + (EXTRA[name] ? " " + EXTRA[name] : ""),
    how: guide?.how ?? null,
    research: guide?.research ?? null,
    // Kept for editors; rendered only once dosing.source is populated.
    dosage: guide?.dosage ?? null,
    researchBullets: guide ? null : BULLETS[grade],
    safety: guide?.safety ?? SAFE_FB[grade],
    faq: guide?.faq ?? [],
    refs: guide?.refs ?? [],
  };

  return {
    slug: slugify(name),
    name,
    subtitle: alias,
    class: CLASS_SLUG[category],
    mechanismClass: e.mechanismClass,
    goals: goals.map((g) => GOAL_SLUG[g]),
    route,
    evidenceGrade,
    citationCount: profile.refs.length + (e.cited ? 1 : 0) || null,
    reviewedOn: null,
    summary: description,
    caveat: e.caveat ?? GENERIC_CAVEAT[evidenceGrade],
    dosing: {
      reportedRange: e.cited ? { min: e.cited.min, max: e.cited.max, unit: e.cited.unit } : null,
      frequency: e.cited?.frequency ?? e.frequency ?? "daily",
      timing: e.timing ?? "any",
      typicalCycleWeeks: e.cited?.typicalCycleWeeks ?? null,
      titration: e.cited?.titration ?? null,
      source: e.cited?.source ?? null,
      // Prototype figure, uncited. Never rendered — for the editor verifying sources.
      conventionNote: facts?.[1] ?? null,
    },
    halfLifeHours: facts ? halfLifeHours(facts[0]) : null,
    halfLifeLabel: facts?.[0] ?? null,
    interactsWith: [] as string[],
    experienceLevel: e.experienceLevel ?? "any",
    profileComplete: full === 1,
    profile,
  };
});

// Fill interactsWith from shared axes (different class, same axis).
for (const a of records) {
  const axis = AXES.find((x) => x.classes.includes(a.mechanismClass));
  if (!axis) continue;
  a.interactsWith = records
    .filter((b) => b !== a && b.mechanismClass !== a.mechanismClass && axis.classes.includes(b.mechanismClass))
    .map((b) => b.slug);
}

for (const rec of records) {
  writeFileSync(join(OUT, `${rec.slug}.json`), JSON.stringify(rec, null, 2) + "\n");
}

writeFileSync(
  join(ROOT, "content", "guides.json"),
  JSON.stringify(
    GUIDE_LIST.map((g) => ({
      slug: g.id,
      tag: g.tag,
      title: g.title,
      dek: g.dek,
      readMinutes: parseInt(g.time, 10),
      ready: g.ready === 1,
      sections: (g.sections ?? []).map(([heading, body]) => ({ heading, body })),
    })),
    null,
    2,
  ) + "\n",
);

writeFileSync(
  join(ROOT, "content", "glossary.json"),
  JSON.stringify(GLOSS.map(([term, definition]) => ({ term, definition })), null, 2) + "\n",
);

console.log(`wrote ${records.length} compounds (${records.filter((r) => r.profileComplete).length} complete)`);
console.log(`cited dosing: ${records.filter((r) => r.dosing.source).map((r) => r.name).join(", ")}`);
