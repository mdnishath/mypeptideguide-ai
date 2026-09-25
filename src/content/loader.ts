/**
 * Server-side content loader. Reads content/*.json at build time and validates
 * every compound against the brief's rules, so a bad edit fails the build
 * instead of shipping. Client components never import this — server pages pass
 * them `CompoundSummary[]` as props, which keeps long-form copy out of the bundle.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DOSE_UNITS,
  EVIDENCE_GRADES,
  FREQUENCIES,
  GOAL_SLUGS,
  ROUTES,
  TIMINGS,
  type CompoundRecord,
  type CompoundSummary,
  type GlossaryTerm,
  type Guide,
} from "@/core/schema";
import { GRADE_RANK } from "@/core/taxonomy";

const CONTENT = join(process.cwd(), "content");

function fail(slug: string, msg: string): never {
  throw new Error(`content/compounds/${slug}.json: ${msg}`);
}

function validate(c: CompoundRecord, file: string) {
  const slug = file.replace(/\.json$/, "");
  if (c.slug !== slug) fail(slug, `slug "${c.slug}" does not match the file name`);
  if (!EVIDENCE_GRADES.includes(c.evidenceGrade)) fail(slug, `unknown evidenceGrade "${c.evidenceGrade}"`);
  for (const g of c.goals) if (!GOAL_SLUGS.includes(g)) fail(slug, `unknown goal "${g}"`);
  if (!c.route.length) fail(slug, "route is empty");
  for (const r of c.route) if (!ROUTES.includes(r)) fail(slug, `unknown route "${r}"`);
  if (!FREQUENCIES.includes(c.dosing.frequency)) fail(slug, `unknown frequency "${c.dosing.frequency}"`);
  if (!TIMINGS.includes(c.dosing.timing)) fail(slug, `unknown timing "${c.dosing.timing}"`);
  const range = c.dosing.reportedRange;
  // The brief's hard rule: if we can't cite it, we don't show a number.
  if (range && !c.dosing.source) fail(slug, "dosing.reportedRange is set but dosing.source is empty");
  if (range && !DOSE_UNITS.includes(range.unit)) fail(slug, `unknown dose unit "${range.unit}"`);
  if (range && range.min > range.max) fail(slug, "reportedRange.min is greater than max");
  if (c.dosing.titration && !c.dosing.source) fail(slug, "titration steps need a dosing.source");
  if (c.profileComplete && !c.caveat) fail(slug, "a published compound needs a caveat line");
}

let cache: CompoundRecord[] | null = null;

export function getAllCompoundRecords(): CompoundRecord[] {
  if (cache) return cache;
  const dir = join(CONTENT, "compounds");
  const records = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((file) => {
      const rec = JSON.parse(readFileSync(join(dir, file), "utf8")) as CompoundRecord;
      validate(rec, file);
      return rec;
    });
  const slugs = new Set(records.map((r) => r.slug));
  for (const r of records) {
    for (const other of r.interactsWith) {
      if (!slugs.has(other)) fail(r.slug, `interactsWith references unknown compound "${other}"`);
    }
  }
  cache = records.sort(
    (a, b) => GRADE_RANK[b.evidenceGrade] - GRADE_RANK[a.evidenceGrade] || a.name.localeCompare(b.name),
  );
  return cache;
}

/** Drops the long-form profile so it never reaches a client bundle. */
function toSummary(rec: CompoundRecord): CompoundSummary {
  const summary: Partial<CompoundRecord> = { ...rec };
  delete summary.profile;
  return summary as CompoundSummary;
}

/** Published compounds only — `profileComplete: false` stays in the dataset but off the site. */
export function getPublishedCompounds(): CompoundSummary[] {
  return getAllCompoundRecords()
    .filter((c) => c.profileComplete)
    .map(toSummary);
}

export function getCompoundRecord(slug: string): CompoundRecord | undefined {
  return getAllCompoundRecords().find((c) => c.slug === slug && c.profileComplete);
}

export function getGuides(): Guide[] {
  return JSON.parse(readFileSync(join(CONTENT, "guides.json"), "utf8")) as Guide[];
}

export function getGlossary(): GlossaryTerm[] {
  return JSON.parse(readFileSync(join(CONTENT, "glossary.json"), "utf8")) as GlossaryTerm[];
}
