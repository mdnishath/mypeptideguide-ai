/**
 * "Add to Google Calendar" links. Google's template URL takes one event with
 * an optional recurrence rule, so each compound becomes one recurring event
 * per run of identical doses (a run breaks at a titration step or a new
 * cycle). Runs are derived from the built schedule, so what lands in the
 * calendar is exactly what the calendar page shows.
 */
import { fmt, formatDose } from "../dose";
import { ROUTE_LABEL } from "../taxonomy";
import type { Frequency } from "../schema";
import type { DoseEvent, Schedule } from "./schedule";
import { toDay } from "./schedule";

export type CalendarEvent = {
  id: string;
  slug: string;
  name: string;
  /** Google event title, e.g. "Ipamorelin — 250 mcg (12.5 units)". */
  title: string;
  details: string;
  date: string;
  time: string;
  count: number;
  rrule: string | null;
  /** Human label for the button: "Cycle 1 · 0.25 mg · 4 weekly doses". */
  label: string;
  firstDate: string;
  lastDate: string;
};

const DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const weekday = (iso: string) => (new Date(toDay(iso) * 86_400_000).getUTCDay() + 6) % 7;

/** Recurrence for a run of `count` doses starting on `startIso`. */
export function rruleFor(freq: Frequency, startIso: string, count: number): string | null {
  if (count <= 1) return null;
  const wd = weekday(startIso);
  switch (freq) {
    case "daily":
      return `RRULE:FREQ=DAILY;COUNT=${count}`;
    case "eod":
      return `RRULE:FREQ=DAILY;INTERVAL=2;COUNT=${count}`;
    case "weekly":
      return `RRULE:FREQ=WEEKLY;COUNT=${count}`;
    case "2x-week":
      return `RRULE:FREQ=WEEKLY;BYDAY=${DAYS[wd]},${DAYS[(wd + 3) % 7]};COUNT=${count}`;
    case "5-on-2-off":
      return `RRULE:FREQ=WEEKLY;BYDAY=${[0, 1, 2, 3, 4].map((i) => DAYS[(wd + i) % 7]).join(",")};COUNT=${count}`;
    case "as-needed":
      return null;
  }
}

function titleOf(ev: DoseEvent) {
  const dose = ev.dose !== null ? ` — ${formatDose(ev.dose, ev.unit)}` : "";
  const units = ev.units !== null ? ` (${fmt(ev.units, 1)} units)` : "";
  return `${ev.name}${dose}${units}`;
}

function detailsOf(ev: DoseEvent, count: number) {
  return [
    ev.dose !== null ? `Dose: ${formatDose(ev.dose, ev.unit)}` : "Dose: not set in your plan",
    ev.units !== null && ev.volumeMl !== null ? `Draw: ${fmt(ev.units, 1)} units on a U-100 syringe (${fmt(ev.volumeMl, 3)} mL)` : null,
    `Route: ${ROUTE_LABEL[ev.route]}`,
    ev.site ? `First site: ${ev.site.label}. Rotate: never the same spot twice in a row.` : null,
    count > 1 ? `${count} doses in this series.` : null,
    "",
    "Your own plan, built at mypeptideguide.ai. Educational only, not medical advice. 18+.",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/** One recurring event per run of identical doses, per compound. */
export function calendarEventsFor(schedule: Schedule, frequencyOf: (slug: string) => Frequency): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  const slugs = Array.from(new Set(schedule.events.map((e) => e.slug)));
  for (const slug of slugs) {
    const evs = schedule.events.filter((e) => e.slug === slug);
    let run: DoseEvent[] = [];
    const flush = () => {
      if (!run.length) return;
      const first = run[0];
      const last = run[run.length - 1];
      const freq = frequencyOf(slug);
      const cycles = new Set(evs.map((e) => e.cycle)).size;
      const doses = new Set(evs.map((e) => e.dose)).size;
      const parts = [
        cycles > 1 ? `Cycle ${first.cycle}` : null,
        doses > 1 && first.dose !== null ? formatDose(first.dose, first.unit) : null,
        `${run.length} dose${run.length === 1 ? "" : "s"}`,
      ].filter(Boolean);
      out.push({
        id: `${slug}|${first.date}|${first.time}`,
        slug,
        name: first.name,
        title: titleOf(first),
        details: detailsOf(first, run.length),
        date: first.date,
        time: first.time,
        count: run.length,
        rrule: rruleFor(freq, first.date, run.length),
        label: parts.join(" · "),
        firstDate: first.date,
        lastDate: last.date,
      });
      run = [];
    };
    for (const ev of evs) {
      const prev = run[run.length - 1];
      if (prev && (prev.cycle !== ev.cycle || prev.dose !== ev.dose)) flush();
      run.push(ev);
    }
    flush();
  }
  return out;
}

/** Google Calendar "create event" link. Times are floating local, like the .ics. */
export function googleCalendarUrl(ev: CalendarEvent, durationMin = 10): string {
  const d = ev.date.replace(/-/g, "");
  const [h, m] = ev.time.split(":").map(Number);
  const endMin = h * 60 + m + durationMin;
  const hhmm = (mins: number) => `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}${String(mins % 60).padStart(2, "0")}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${d}T${hhmm(h * 60 + m)}00/${d}T${hhmm(endMin)}00`,
    details: ev.details,
  });
  if (ev.rrule) params.set("recur", ev.rrule);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
