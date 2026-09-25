/**
 * Plan → dated schedule. Pure: same plan in, same schedule out, so the calendar,
 * the print view and the .ics export can never disagree.
 *
 * Dates are handled as "YYYY-MM-DD" strings with UTC-midnight arithmetic, which
 * sidesteps daylight-saving shifts. Times are local wall-clock "HH:MM".
 */
import type { CompoundSummary, DoseUnit, Route } from "../schema";
import { INJECTED_ROUTES } from "../taxonomy";
import { concentration, drawMl, toMg, u100 } from "../dose";
import type { Plan, PlanItem } from "./plan";

/** Reconstituted vials are treated as expired after 28 days refrigerated. */
export const VIAL_SHELF_DAYS = 28;

export type Site = { id: string; label: string };

/** Standard SubQ rotation, in the order used to break ties. */
export const SUBQ_SITES: Site[] = [
  { id: "abd-ul", label: "Abdomen, upper left" },
  { id: "abd-ur", label: "Abdomen, upper right" },
  { id: "abd-ll", label: "Abdomen, lower left" },
  { id: "abd-lr", label: "Abdomen, lower right" },
  { id: "thigh-l", label: "Left thigh, front" },
  { id: "thigh-r", label: "Right thigh, front" },
  { id: "flank-l", label: "Left flank" },
  { id: "flank-r", label: "Right flank" },
  { id: "arm-l", label: "Left upper arm, back" },
  { id: "arm-r", label: "Right upper arm, back" },
];

export const IM_SITES: Site[] = [
  { id: "delt-l", label: "Left deltoid" },
  { id: "delt-r", label: "Right deltoid" },
  { id: "glute-l", label: "Left glute" },
  { id: "glute-r", label: "Right glute" },
  { id: "vl-l", label: "Left outer thigh" },
  { id: "vl-r", label: "Right outer thigh" },
];

export type VialState = {
  number: number;
  reconstituted: string;
  expiresOn: string;
  /** Doses left in this vial after this one. */
  dosesLeft: number;
  daysToExpiry: number;
  isNew: boolean;
};

export type DoseEvent = {
  id: string;
  slug: string;
  name: string;
  date: string;
  time: string;
  dose: number | null;
  unit: DoseUnit;
  /** mL to draw, when the vial and water are known. */
  volumeMl: number | null;
  /** Units on a U-100 syringe. */
  units: number | null;
  route: Route;
  site: Site | null;
  vial: VialState | null;
  stepUp: boolean;
  cycle: number;
};

export type Marker = {
  date: string;
  slug: string;
  kind: "cycle-end" | "off-start";
  label: string;
};

export type OffBlock = { slug: string; name: string; from: string; to: string };

export type Schedule = {
  events: DoseEvent[];
  markers: Marker[];
  offBlocks: OffBlock[];
  /** Items with an "as needed" frequency — listed, not scheduled. */
  asNeeded: PlanItem[];
  start: string;
  end: string;
};

/* ------------------------------- date helpers ------------------------------ */

const DAY = 86_400_000;
export const toDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
};
export const fromDay = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => fromDay(toDay(iso) + n);
export const daysBetween = (a: string, b: string) => toDay(b) - toDay(a);

const minutesOf = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/* ------------------------------ frequency rule ----------------------------- */

function isDoseDay(freq: PlanItem["frequency"], dayInCycle: number) {
  const dow = dayInCycle % 7;
  switch (freq) {
    case "daily":
      return true;
    case "eod":
      return dayInCycle % 2 === 0;
    case "2x-week":
      return dow === 0 || dow === 3;
    case "weekly":
      return dow === 0;
    case "5-on-2-off":
      return dow < 5;
    case "as-needed":
      return false;
  }
}

function doseAt(item: PlanItem, dayInCycle: number) {
  if (!item.titration?.length) return item.dose;
  let current = item.titration[0].dose;
  for (const step of item.titration) if (step.week * 7 <= dayInCycle) current = step.dose;
  return current;
}

/* --------------------------------- builder --------------------------------- */

export function buildSchedule(plan: Plan, bySlug: Map<string, CompoundSummary>): Schedule {
  const events: DoseEvent[] = [];
  const markers: Marker[] = [];
  const offBlocks: OffBlock[] = [];
  const asNeeded: PlanItem[] = [];
  let end = plan.startDate;

  for (const item of plan.items) {
    const c = bySlug.get(item.slug);
    if (!c) continue;
    if (item.frequency === "as-needed") {
      asNeeded.push(item);
      continue;
    }

    const on = item.cycleWeeks * 7;
    const off = item.offWeeks * 7;
    const conc = concentration(item.vialMg, item.waterMl);
    const itemEvents: DoseEvent[] = [];

    for (let cycle = 0; cycle < item.repeats; cycle++) {
      const cycleStart = addDays(plan.startDate, cycle * (on + off));
      for (let d = 0; d < on; d++) {
        if (!isDoseDay(item.frequency, d)) continue;
        const date = addDays(cycleStart, d);
        const dose = doseAt(item, d);
        const ml = dose && conc ? drawMl(toMg(dose, item.unit), conc) : 0;
        itemEvents.push({
          id: `${item.slug}|${date}|${item.time}`,
          slug: item.slug,
          name: c.name,
          date,
          time: item.time,
          dose,
          unit: item.unit,
          volumeMl: ml || null,
          units: ml ? u100(ml) : null,
          route: item.route,
          site: null,
          vial: null,
          stepUp: false,
          cycle: cycle + 1,
        });
      }
      const lastOn = addDays(cycleStart, on - 1);
      markers.push({
        date: lastOn,
        slug: item.slug,
        kind: "cycle-end",
        label: item.repeats > 1 ? `${c.name} · cycle ${cycle + 1} ends` : `${c.name} · cycle ends`,
      });
      end = lastOn > end ? lastOn : end;
      if (off > 0) {
        const from = addDays(cycleStart, on);
        const to = addDays(cycleStart, on + off - 1);
        offBlocks.push({ slug: item.slug, name: c.name, from, to });
        markers.push({ date: from, slug: item.slug, kind: "off-start", label: `${c.name} · ${item.offWeeks} weeks off` });
        end = to > end ? to : end;
      }
    }

    // Step-ups: the first dose at a higher titration step.
    for (let i = 1; i < itemEvents.length; i++) {
      const prev = itemEvents[i - 1].dose;
      const cur = itemEvents[i].dose;
      if (prev !== null && cur !== null && cur > prev) itemEvents[i].stepUp = true;
    }

    // Vial countdown: a new vial when this one can't cover the dose or is past shelf life.
    if (item.vialMg) {
      let number = 0;
      let remainingMg = 0;
      let reconstituted = "";
      for (const ev of itemEvents) {
        if (ev.dose === null) continue;
        const doseMg = toMg(ev.dose, ev.unit);
        const expired = number > 0 && daysBetween(reconstituted, ev.date) >= VIAL_SHELF_DAYS;
        const isNew = number === 0 || remainingMg + 1e-9 < doseMg || expired;
        if (isNew) {
          number += 1;
          remainingMg = item.vialMg;
          reconstituted = ev.date;
        }
        remainingMg -= doseMg;
        const expiresOn = addDays(reconstituted, VIAL_SHELF_DAYS);
        ev.vial = {
          number,
          reconstituted,
          expiresOn,
          dosesLeft: Math.max(0, Math.floor(remainingMg / doseMg + 1e-9)),
          daysToExpiry: daysBetween(ev.date, expiresOn),
          isNew,
        };
      }
    }

    events.push(...itemEvents);
  }

  events.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.name.localeCompare(b.name));

  // Site rotation across every injection in the plan: longest-rested first.
  const lastUsed = new Map<string, number>();
  for (const ev of events) {
    if (!INJECTED_ROUTES.includes(ev.route) || ev.route === "iv") continue;
    const sites = ev.route === "im" ? IM_SITES : SUBQ_SITES;
    const at = toDay(ev.date) * 1440 + minutesOf(ev.time);
    let pick = sites[0];
    let oldest = Infinity;
    for (const s of sites) {
      const used = lastUsed.get(s.id) ?? -Infinity;
      if (used < oldest) {
        oldest = used;
        pick = s;
      }
    }
    ev.site = pick;
    lastUsed.set(pick.id, at);
  }

  markers.sort((a, b) => a.date.localeCompare(b.date));
  return { events, markers, offBlocks, asNeeded, start: plan.startDate, end };
}
