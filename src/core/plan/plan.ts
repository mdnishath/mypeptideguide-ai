/**
 * The plan: what the user selected, as they edited it. Serializable and
 * schema-versioned (`v`) so a persistence layer can be added later without
 * breaking saved links, downloaded JSON or localStorage.
 */
import type { CompoundSummary, DoseUnit, Frequency, Route, TitrationStep } from "../schema";
import { DOSE_UNITS, FREQUENCIES, ROUTES } from "../schema";
import { INJECTED_ROUTES, TIMING_CLOCK } from "../taxonomy";
import { CYCLE_WEEKS, type CyclePref, type RouteComfort } from "../guide/questions";

export const PLAN_VERSION = 1;

export type PlanItem = {
  slug: string;
  /** null until the user enters one — we never invent a number. */
  dose: number | null;
  unit: DoseUnit;
  frequency: Frequency;
  /** 24-hour "HH:MM", local time. */
  time: string;
  route: Route;
  /** Weeks on per cycle. */
  cycleWeeks: number;
  /** Weeks off after each on-period; 0 = not cycling. */
  offWeeks: number;
  /** How many on/off cycles to schedule. */
  repeats: number;
  /** Step-ups, as weeks from the start of each cycle. */
  titration: TitrationStep[] | null;
  vialMg: number | null;
  waterMl: number | null;
};

export type Plan = {
  v: typeof PLAN_VERSION;
  /** "YYYY-MM-DD", local. */
  startDate: string;
  items: PlanItem[];
  /** From guide question 5 — feeds the "already taking" warning. */
  currentlyTaking: string[];
};

export function todayISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function emptyPlan(): Plan {
  return { v: PLAN_VERSION, startDate: todayISO(), items: [], currentlyTaking: [] };
}

/**
 * A new item pre-filled from the literature. Dose is pre-filled only when the
 * compound has a cited range (or cited titration) — otherwise it stays empty.
 */
export function defaultItem(
  c: CompoundSummary,
  opts: { cycle?: CyclePref | null; routeComfort?: RouteComfort | null } = {},
): PlanItem {
  const d = c.dosing;
  const cited = d.source ? d.reportedRange : null;
  const titration = d.source && d.titration ? d.titration.map((s) => ({ ...s })) : null;

  const injected = c.route.find((r) => INJECTED_ROUTES.includes(r));
  const other = c.route.find((r) => !INJECTED_ROUTES.includes(r));
  const route = (opts.routeComfort === "no-injection" ? other : injected) ?? c.route[0];

  const cycleWeeks = opts.cycle ? CYCLE_WEEKS[opts.cycle] : (d.typicalCycleWeeks ?? 12);

  return {
    slug: c.slug,
    dose: titration ? titration[0].dose : (cited?.min ?? null),
    unit: cited?.unit ?? "mcg",
    frequency: d.frequency,
    time: TIMING_CLOCK[d.timing],
    route,
    cycleWeeks: Math.max(1, cycleWeeks),
    offWeeks: 0,
    repeats: 1,
    titration,
    vialMg: null,
    waterMl: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Validation — every plan from a URL, a file or storage passes through here.  */
/* -------------------------------------------------------------------------- */

const num = (v: unknown) => (typeof v === "number" && isFinite(v) && v > 0 ? v : null);
const int = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : fallback;

export function parsePlan(raw: unknown, knownSlugs?: Set<string>): Plan | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  if (p.v !== PLAN_VERSION) return null; // future: migrate older versions here
  const startDate = typeof p.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.startDate) ? p.startDate : todayISO();
  const items: PlanItem[] = [];
  for (const it of Array.isArray(p.items) ? p.items : []) {
    if (!it || typeof it !== "object") continue;
    const i = it as Record<string, unknown>;
    if (typeof i.slug !== "string" || (knownSlugs && !knownSlugs.has(i.slug))) continue;
    const titration = Array.isArray(i.titration)
      ? (i.titration as unknown[])
          .map((s) => s as Record<string, unknown>)
          .filter((s) => typeof s.week === "number" && s.week >= 0 && num(s.dose))
          .map((s) => ({ week: Math.floor(s.week as number), dose: s.dose as number }))
          .sort((a, b) => a.week - b.week)
      : null;
    items.push({
      slug: i.slug,
      dose: num(i.dose),
      unit: DOSE_UNITS.includes(i.unit as DoseUnit) ? (i.unit as DoseUnit) : "mcg",
      frequency: FREQUENCIES.includes(i.frequency as Frequency) ? (i.frequency as Frequency) : "daily",
      time: typeof i.time === "string" && /^\d{2}:\d{2}$/.test(i.time) ? i.time : "09:00",
      route: ROUTES.includes(i.route as Route) ? (i.route as Route) : "subq",
      cycleWeeks: int(i.cycleWeeks, 1, 104, 12),
      offWeeks: int(i.offWeeks, 0, 52, 0),
      repeats: int(i.repeats, 1, 8, 1),
      titration: titration && titration.length ? titration : null,
      vialMg: num(i.vialMg),
      waterMl: num(i.waterMl),
    });
  }
  const currentlyTaking = Array.isArray(p.currentlyTaking)
    ? (p.currentlyTaking as unknown[]).filter((s): s is string => typeof s === "string")
    : [];
  return { v: PLAN_VERSION, startDate, items, currentlyTaking };
}

/* -------------------------------------------------------------------------- */
/* URL codec — `?p=<base64url JSON>` for bookmarking and moving devices.       */
/* -------------------------------------------------------------------------- */

function toBase64Url(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
}

export function encodePlan(plan: Plan) {
  return toBase64Url(JSON.stringify(plan));
}

export function decodePlan(param: string, knownSlugs?: Set<string>): Plan | null {
  try {
    return parsePlan(JSON.parse(fromBase64Url(param)), knownSlugs);
  } catch {
    return null;
  }
}

export function planUrl(origin: string, path: "/protocol" | "/calendar", plan: Plan) {
  return `${origin}${path}?p=${encodePlan(plan)}`;
}

export const samePlan = (a: Plan | null, b: Plan | null) => JSON.stringify(a) === JSON.stringify(b);
