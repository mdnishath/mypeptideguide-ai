"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CompoundSummary } from "@/core/schema";
import { ROUTE_LABEL } from "@/core/taxonomy";
import { fmt, formatDose } from "@/core/dose";
import { todayISO, type Plan } from "@/core/plan/plan";
import { usePlan } from "@/state/usePlan";
import { IM_SITES, SUBQ_SITES, addDays, buildSchedule, daysBetween, toDay, type DoseEvent, type Schedule } from "@/core/plan/schedule";
import { calendarEventsFor } from "@/core/plan/google";
import CalendarExport from "../plan/CalendarExport";
import { KEYS, useStored } from "@/state/store";
import { Button, Container, Display, Em, Notice } from "@/design/primitives";
import { DateField, Field } from "../plan/fields";
import PlanActions, { IncomingBanner } from "../plan/PlanActions";
import BodyDiagram from "./BodyDiagram";

/* --------------------------------- helpers -------------------------------- */

/** Per-compound colours, from the brand family. */
const SWATCH = ["#1486c9", "#73b84a", "#d9368a", "#8d43b8", "#f47b2a", "#2e5bd7"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const weekday = (iso: string) => (new Date(toDay(iso) * 86_400_000).getUTCDay() + 6) % 7;
const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;
const addMonths = (iso: string, n: number) => {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 10);
};
const longDate = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, opts);
const monthLabel = (iso: string) => longDate(iso, { month: "long", year: "numeric" });
const clock = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};
const doseText = (ev: DoseEvent) => (ev.dose === null ? "dose not set" : `${formatDose(ev.dose, ev.unit)}${ev.units !== null ? ` · ${fmt(ev.units, 1)} units` : ""}`);

/* -------------------------------- event row ------------------------------- */

function EventRow({ ev, color, taken, onToggle, detailed = false }: { ev: DoseEvent; color: string; taken: boolean; onToggle: () => void; detailed?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={taken}
        aria-label={`${taken ? "Untick" : "Tick"} ${ev.name} on ${ev.date}`}
        onClick={onToggle}
        className={`mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors ${taken ? "border-transparent text-white" : "border-line-2 hover:border-ink"}`}
        style={taken ? { background: color } : undefined}
      >
        {taken && <Check size={13} strokeWidth={3} aria-hidden="true" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={`text-[15px] font-medium text-ink ${taken ? "line-through opacity-50" : ""}`}>{ev.name}</span>
          <span className="tnum text-[12px] text-muted">{clock(ev.time)}</span>
          {ev.stepUp && <span className="text-[11px] font-semibold text-orange-deep">↑ step-up</span>}
        </div>
        <div className="tnum mt-0.5 text-[13px] text-body">
          <span className="text-ink">{doseText(ev)}</span> · {ROUTE_LABEL[ev.route]}
          {ev.site ? ` · ${ev.site.label}` : ""}
        </div>
        {detailed && ev.vial && (
          <div className="mt-1 text-[12px] text-body">
            {ev.vial.isNew && <span className="font-medium text-blue-deep">Reconstitute vial {ev.vial.number} today. </span>}
            Vial {ev.vial.number}: {ev.vial.dosesLeft} left after this · use by {longDate(ev.vial.expiresOn)}
            {ev.vial.daysToExpiry <= 3 && <span className="font-medium text-orange-deep"> · expires in {ev.vial.daysToExpiry}d</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- month --------------------------------- */

function MonthGrid({
  month,
  schedule,
  byDate,
  colorOf,
  taken,
  today,
  selected,
  onSelect,
}: {
  month: string;
  schedule: Schedule;
  byDate: Map<string, DoseEvent[]>;
  colorOf: (slug: string) => string;
  taken: Record<string, true>;
  today: string;
  selected: string | null;
  onSelect: (d: string) => void;
}) {
  const first = monthStart(month);
  const gridStart = addDays(first, -weekday(first));
  const weeks = Math.ceil((weekday(first) + daysBetween(first, addMonths(first, 1))) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="border-t border-l border-line">
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <div key={d} className="eyebrow border-r border-b border-line px-2 py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const inMonth = d.slice(0, 7) === first.slice(0, 7);
          const evs = byDate.get(d) ?? [];
          const off = schedule.offBlocks.filter((b) => d >= b.from && d <= b.to);
          const ends = schedule.markers.some((m) => m.date === d && m.kind === "cycle-end");
          const allTaken = evs.length > 0 && evs.every((e) => taken[e.id]);
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              aria-label={`${longDate(d)}: ${evs.length} dose${evs.length === 1 ? "" : "s"}`}
              aria-pressed={selected === d}
              className={`relative flex min-h-[84px] cursor-pointer flex-col items-stretch gap-0.5 border-r border-b border-line p-1.5 text-left transition-colors sm:min-h-[100px] ${
                selected === d ? "bg-blue-wash" : "hover:bg-paper-2"
              } ${inMonth ? "" : "opacity-35"}`}
              style={off.length ? { backgroundImage: "repeating-linear-gradient(135deg, transparent 0 6px, var(--color-paper-3) 6px 8px)" } : undefined}
            >
              <span className="flex items-center justify-between">
                <span className={`tnum flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[12px] ${d === today ? "bg-blue font-semibold text-white" : "text-ink"}`}>
                  {Number(d.slice(8))}
                </span>
                {allTaken && <Check size={13} strokeWidth={2.5} className="text-green-deep" aria-hidden="true" />}
              </span>
              {evs.slice(0, 3).map((ev) => (
                <span key={ev.id} className={`flex items-center gap-1 truncate text-[11px] ${taken[ev.id] ? "text-muted line-through" : "text-ink"}`}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colorOf(ev.slug) }} />
                  <span className="truncate">
                    {ev.stepUp ? "↑ " : ""}
                    {ev.name}
                  </span>
                </span>
              ))}
              {evs.length > 3 && <span className="text-[10.5px] text-muted">+{evs.length - 3} more</span>}
              {off.length > 0 && <span className="text-[10.5px] font-medium text-muted">off · {off.map((o) => o.name).join(", ")}</span>}
              {ends && <span className="text-[10.5px] font-medium text-orange-deep">cycle ends</span>}
              {evs.some((e) => e.vial?.isNew) && <span className="text-[10.5px] font-medium text-blue-deep">new vial</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ print chart ------------------------------- */

function PrintChart({ schedule, byDate, plan }: { schedule: Schedule; byDate: Map<string, DoseEvent[]>; plan: Plan }) {
  const months: string[] = [];
  for (let m = monthStart(schedule.start); m <= schedule.end; m = addMonths(m, 1)) months.push(m);
  return (
    <div data-print="only" className="hidden text-black">
      {months.map((m) => {
        const first = monthStart(m);
        const gridStart = addDays(first, -weekday(first));
        const weeks = Math.ceil((weekday(first) + daysBetween(first, addMonths(first, 1))) / 7);
        return (
          <section key={m} data-print="page" className="mb-4">
            <div className="flex items-baseline justify-between border-b-2 border-black pb-1">
              <h2 className="m-0 name text-[20px]">{monthLabel(m)}</h2>
              <span className="text-[9px]">mypeptideguide.ai · plan from {plan.startDate} · Educational only, not medical advice · 18+</span>
            </div>
            <table className="mt-1 w-full table-fixed border-collapse text-[8.5px] leading-tight">
              <thead>
                <tr>
                  {WEEKDAYS.map((d) => (
                    <th key={d} className="border border-gray-400 py-0.5 font-semibold">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: weeks }, (_, w) => (
                  <tr key={w}>
                    {Array.from({ length: 7 }, (_, i) => {
                      const d = addDays(gridStart, w * 7 + i);
                      const inMonth = d.slice(0, 7) === first.slice(0, 7);
                      const off = schedule.offBlocks.some((b) => d >= b.from && d <= b.to);
                      return (
                        <td key={d} className="h-[88px] border border-gray-400 p-1 align-top">
                          {inMonth && (
                            <>
                              <div className="font-semibold">
                                {Number(d.slice(8))}
                                {off ? " · off" : ""}
                              </div>
                              {(byDate.get(d) ?? []).map((ev) => (
                                <div key={ev.id} className="mt-0.5">
                                  ☐ {ev.name} {ev.dose !== null ? formatDose(ev.dose, ev.unit) : ""}
                                  {ev.units !== null ? ` · ${fmt(ev.units, 1)}u` : ""}
                                  {ev.site ? ` · ${ev.site.label}` : ""}
                                  {ev.stepUp ? " ↑" : ""}
                                  {ev.vial?.isNew ? " · NEW VIAL" : ""}
                                </div>
                              ))}
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function Calendar({ compounds }: { compounds: CompoundSummary[] }) {
  const bySlug = useMemo(() => new Map(compounds.map((c) => [c.slug, c])), [compounds]);
  const known = useMemo(() => new Set(bySlug.keys()), [bySlug]);
  const { plan, setPlan, hydrated, conflict, acceptIncoming, dismissIncoming } = usePlan(known);
  const [taken, setTaken] = useStored<Record<string, true>>(KEYS.taken, {});
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const schedule = useMemo(() => (plan ? buildSchedule(plan, bySlug) : null), [plan, bySlug]);
  const gcal = useMemo(
    () => (schedule && plan ? calendarEventsFor(schedule, (slug) => plan.items.find((i) => i.slug === slug)?.frequency ?? "daily") : []),
    [schedule, plan],
  );
  const byDate = useMemo(() => {
    const m = new Map<string, DoseEvent[]>();
    for (const ev of schedule?.events ?? []) m.set(ev.date, [...(m.get(ev.date) ?? []), ev]);
    return m;
  }, [schedule]);

  if (!hydrated) return <div className="min-h-[70vh]" />;

  if (!plan || !schedule || plan.items.length === 0) {
    return (
      <Container className="flex flex-col items-center py-24 text-center">
        <Display size="md">No protocol yet.</Display>
        <p className="measure mt-4 text-[16px] leading-[1.6] text-body">The calendar is generated from your protocol. Start with the guide, or build a protocol from the library.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/guide" size="lg" arrow>
            Start the guide
          </Button>
          <Button href="/protocol" variant="secondary" size="lg">
            Open the protocol builder
          </Button>
        </div>
      </Container>
    );
  }

  const today = todayISO();
  const colorOf = (slug: string) => SWATCH[Math.max(0, plan.items.findIndex((i) => i.slug === slug)) % SWATCH.length];
  const focus = cursor ?? (today >= schedule.start && today <= schedule.end ? today : schedule.start);
  const toggle = (id: string) => {
    const next = { ...taken };
    if (next[id]) delete next[id];
    else next[id] = true;
    setTaken(next);
  };

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isPast = (ev: DoseEvent) => (ev.date !== today ? ev.date < today : Number(ev.time.slice(0, 2)) * 60 + Number(ev.time.slice(3)) <= nowMin);
  const past = schedule.events.filter(isPast);
  const pastTaken = past.filter((e) => taken[e.id]).length;
  const upcoming = schedule.events.find((e) => e.date >= today && !taken[e.id]) ?? null;
  const recentSites = schedule.events
    .filter((e) => e.site && upcoming && (e.date < upcoming.date || (e.date === upcoming.date && e.time < upcoming.time)))
    .slice(-6)
    .reverse()
    .map((e) => e.site!);

  const vials = plan.items
    .filter((i) => i.vialMg)
    .map((i) => {
      const evs = schedule.events.filter((e) => e.slug === i.slug && e.vial);
      const current = [...evs].reverse().find((e) => e.date <= today) ?? evs[0];
      const nextNew = evs.find((e) => e.date > today && e.vial?.isNew);
      return { item: i, current, nextNew };
    })
    .filter((v) => v.current);

  const weekStart = addDays(focus, -weekday(focus));
  const dayEvents = selected ? (byDate.get(selected) ?? []) : [];

  const navBtn = "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line-2 text-ink hover:border-ink";

  return (
    <>
      <Container wide className="pt-12 sm:pt-16">
        <div data-print="hide">
          <div className="eyebrow text-purple-deep">Your calendar</div>
          <Display size="lg" className="mt-3">
            {schedule.events.length} doses, {longDate(schedule.start, { day: "numeric", month: "short" })} to{" "}
            <Em>{longDate(schedule.end, { day: "numeric", month: "short", year: "numeric" })}.</Em>
          </Display>
          <p className="mt-3 mb-0 text-[15px] text-body">
            Generated from{" "}
            <Link href="/protocol" className="font-medium text-blue-deep hover:text-ink">
              your protocol
            </Link>
            . Change anything there and this updates.
          </p>
          {conflict && <IncomingBanner count={conflict.items.length} onAccept={acceptIncoming} onDismiss={dismissIncoming} />}
          <Notice compact className="mt-6" />

          {/* Exports first: it's what makes a web product competitive with an app */}
          <div className="hairline mt-8 pt-6">
            <h2 className="m-0 text-[18px] font-bold tracking-[-0.02em] text-ink">Put it on your calendar</h2>
            <p className="mt-1 mb-5 text-[13px] text-body">One tap. Ticks on this page stay in this browser; reminders fire in whatever calendar you add it to.</p>
            <CalendarExport schedule={schedule} gcal={gcal} print />
            <div className="mt-5">
              <PlanActions plan={plan} knownSlugs={known} onImport={(p) => setPlan(p)} path="/calendar" />
            </div>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
            {/* Schedule */}
            <section aria-label="Schedule" className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button type="button" aria-label="Previous" onClick={() => setCursor(view === "month" ? addMonths(focus, -1) : addDays(focus, -7))} className={navBtn}>
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Next" onClick={() => setCursor(view === "month" ? addMonths(focus, 1) : addDays(focus, 7))} className={navBtn}>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
                <h2 className="m-0 flex-1 name text-[24px] text-ink">
                  {view === "month" ? monthLabel(focus) : `Week of ${longDate(weekStart, { day: "numeric", month: "long" })}`}
                </h2>
                <button type="button" onClick={() => setCursor(today)} className="cursor-pointer text-[13px] font-medium text-body hover:text-ink">
                  Today
                </button>
                <div role="radiogroup" aria-label="View" className="inline-flex rounded-full border border-line-2 p-0.5">
                  {(["month", "week"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={view === v}
                      onClick={() => setView(v)}
                      className={`cursor-pointer rounded-full px-3.5 py-1 text-[13px] font-medium capitalize ${view === v ? "bg-ink text-paper" : "text-body hover:text-ink"}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {view === "month" ? (
                <>
                  <MonthGrid month={focus} schedule={schedule} byDate={byDate} colorOf={colorOf} taken={taken} today={today} selected={selected} onSelect={setSelected} />
                  {selected && (
                    <div className="hairline mt-6 pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="m-0 name text-[22px] text-ink">{longDate(selected, { weekday: "long", day: "numeric", month: "long" })}</h3>
                        <button type="button" onClick={() => setSelected(null)} aria-label="Close day" className="cursor-pointer p-1 text-muted hover:text-ink">
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                      {dayEvents.length ? (
                        <div className="mt-1 divide-y divide-line">
                          {dayEvents.map((ev) => (
                            <EventRow key={ev.id} ev={ev} color={colorOf(ev.slug)} taken={!!taken[ev.id]} onToggle={() => toggle(ev.id)} detailed />
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 mb-0 text-[14px] text-body">No doses scheduled.</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="grid gap-px border border-line bg-line md:grid-cols-7">
                  {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d) => {
                    const evs = byDate.get(d) ?? [];
                    const off = schedule.offBlocks.filter((b) => d >= b.from && d <= b.to);
                    return (
                      <div key={d} className={`min-h-[140px] bg-paper p-2 ${d === today ? "shadow-[inset_0_2px_0_var(--color-blue)]" : ""}`}>
                        <div className="text-[12px] font-semibold text-ink">{longDate(d)}</div>
                        <div className="divide-y divide-line">
                          {evs.map((ev) => (
                            <EventRow key={ev.id} ev={ev} color={colorOf(ev.slug)} taken={!!taken[ev.id]} onToggle={() => toggle(ev.id)} />
                          ))}
                        </div>
                        {off.map((o) => (
                          <div key={o.slug} className="mt-1 text-[11px] font-medium text-muted">
                            {o.name} · off week
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {schedule.asNeeded.length > 0 && (
                <p className="mt-5 mb-0 text-[13px] text-body">
                  <span className="font-medium text-ink">Not scheduled:</span> {schedule.asNeeded.map((i) => bySlug.get(i.slug)?.name).join(", ")}, set to
                  &ldquo;as needed&rdquo;, so there are no fixed dates to put on a calendar.
                </p>
              )}
            </section>

            {/* Side rail */}
            <aside className="flex flex-col gap-8">
              <div>
                <Field label="Start date">
                  <DateField value={plan.startDate} onChange={(v) => setPlan({ ...plan, startDate: v })} />
                </Field>
                <p className="mt-2 mb-0 text-[12.5px] text-body">
                  {past.length
                    ? `${pastTaken} of ${past.length} past doses ticked.`
                    : `Starts ${daysBetween(today, schedule.start) === 0 ? "today" : `in ${daysBetween(today, schedule.start)} days`}.`}
                </p>
              </div>

              <div>
                <div className="eyebrow">Next dose</div>
                {upcoming ? (
                  <>
                    <EventRow ev={upcoming} color={colorOf(upcoming.slug)} taken={false} onToggle={() => toggle(upcoming.id)} detailed />
                    <p className="mt-0 mb-3 text-[12px] text-muted">{longDate(upcoming.date, { weekday: "long", day: "numeric", month: "long" })}</p>
                    {upcoming.site && <BodyDiagram sites={upcoming.route === "im" ? IM_SITES : SUBQ_SITES} next={upcoming.site} recent={recentSites} />}
                  </>
                ) : (
                  <p className="mt-2 mb-0 text-[14px] text-body">Nothing left to tick in this plan.</p>
                )}
              </div>

              {vials.length > 0 && (
                <div>
                  <div className="eyebrow">Vials</div>
                  <p className="mt-1 mb-0 text-[12px] text-muted">If you follow the schedule. 28-day refrigerated shelf life.</p>
                  <ul className="m-0 mt-2 list-none divide-y divide-line p-0">
                    {vials.map(({ item, current, nextNew }) => {
                      const v = current!.vial!;
                      const left = daysBetween(today, v.expiresOn);
                      return (
                        <li key={item.slug} className="py-3">
                          <div className="flex items-center gap-2 text-[14px] font-medium text-ink">
                            <span className="h-2 w-2 rounded-full" style={{ background: colorOf(item.slug) }} />
                            {current!.name}
                            <span className="ml-auto text-[12px] font-medium text-blue-deep">vial {v.number}</span>
                          </div>
                          <div className="tnum mt-1 text-[13px] text-body">
                            {v.dosesLeft} dose{v.dosesLeft === 1 ? "" : "s"} left · use by {longDate(v.expiresOn)}
                          </div>
                          {left <= 3 && left >= 0 && <div className="mt-0.5 text-[12px] font-medium text-orange-deep">Expires in {left} day{left === 1 ? "" : "s"}</div>}
                          {left < 0 && <div className="mt-0.5 text-[12px] font-medium text-magenta-deep">Past its 28-day window</div>}
                          {nextNew && <div className="mt-0.5 text-[12px] text-body">Next vial: {longDate(nextNew.date)}</div>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div>
                <div className="eyebrow">Key</div>
                <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0 text-[13px] text-body">
                  {plan.items.map((i) => (
                    <li key={i.slug} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorOf(i.slug) }} />
                      {bySlug.get(i.slug)?.name}
                    </li>
                  ))}
                  <li>↑ titration step-up · cycle ends · new vial</li>
                  <li className="flex items-center gap-2">
                    <span className="h-3 w-5" style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 3px, var(--color-line-2) 3px 5px)" }} />
                    Off weeks
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </Container>

      <PrintChart schedule={schedule} byDate={byDate} plan={plan} />
    </>
  );
}
