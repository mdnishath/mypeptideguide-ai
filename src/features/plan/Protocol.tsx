"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Download, Plus } from "lucide-react";
import type { CompoundSummary } from "@/core/schema";
import { defaultItem, emptyPlan, todayISO, type Plan, type PlanItem } from "@/core/plan/plan";
import { planWarnings } from "@/core/plan/warnings";
import { buildSchedule } from "@/core/plan/schedule";
import { calendarEventsFor } from "@/core/plan/google";
import { downloadText, scheduleToIcs } from "@/core/plan/ics";
import { fmt, formatDose } from "@/core/dose";
import { usePlan } from "@/state/usePlan";
import { Button, Container, Display, Em, Eyebrow, Lede, Notice } from "@/design/primitives";
import { TONES, toneStyle, type ToneKey } from "@/design/tones";
import BodyDiagram from "@/features/calendar/BodyDiagram";
import { IM_SITES, SUBQ_SITES } from "@/core/plan/schedule";
import { DateField, Field } from "./fields";
import CompoundSteps, { summaryOf } from "./CompoundSteps";
import GoogleCalendarList from "./GoogleCalendar";
import PlanActions, { IncomingBanner } from "./PlanActions";

const TONE_ORDER: ToneKey[] = ["blue", "purple", "green", "orange", "magenta", "cyan", "royal", "indigo"];
const longDate = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, opts);

function AddCompound({ compounds, exclude, onAdd }: { compounds: CompoundSummary[]; exclude: Set<string>; onAdd: (c: CompoundSummary) => void }) {
  const [slug, setSlug] = useState("");
  const options = compounds.filter((c) => !exclude.has(c.slug)).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[22px] border border-dashed border-line-2 bg-paper px-6 py-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-wash text-blue-deep">
        <Plus size={18} aria-hidden="true" />
      </span>
      <label htmlFor="add-compound" className="text-[15px] font-semibold text-ink">
        Add a compound
      </label>
      <select id="add-compound" value={slug} onChange={(e) => setSlug(e.target.value)} className="h-10 min-w-0 flex-1 cursor-pointer border-b border-line-2 bg-transparent text-[15px] text-ink outline-none focus:border-blue">
        <option value="">Choose from the library…</option>
        {options.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name} — {c.subtitle}
          </option>
        ))}
      </select>
      <Button
        variant="ink"
        size="sm"
        disabled={!slug}
        onClick={() => {
          const c = compounds.find((x) => x.slug === slug);
          if (c) onAdd(c);
          setSlug("");
        }}
      >
        Add
      </Button>
    </div>
  );
}

export default function Protocol({ compounds }: { compounds: CompoundSummary[] }) {
  const bySlug = useMemo(() => new Map(compounds.map((c) => [c.slug, c])), [compounds]);
  const known = useMemo(() => new Set(bySlug.keys()), [bySlug]);
  const { plan: current, setPlan, hydrated, conflict, acceptIncoming, dismissIncoming } = usePlan(known);
  const plan: Plan = current ?? emptyPlan();
  const warnings = useMemo(() => planWarnings(plan, bySlug), [plan, bySlug]);
  const schedule = useMemo(() => buildSchedule(plan, bySlug), [plan, bySlug]);
  const gcal = useMemo(() => calendarEventsFor(schedule, (slug) => plan.items.find((i) => i.slug === slug)?.frequency ?? "daily"), [schedule, plan.items]);
  const [icsError, setIcsError] = useState<string | null>(null);

  if (!hydrated) return <div className="min-h-[70vh]" />;

  const save = (patch: Partial<Plan>) => setPlan({ ...plan, ...patch });
  const setItem = (i: number, next: PlanItem) => save({ items: plan.items.map((it, j) => (j === i ? next : it)) });
  const inPlan = new Set(plan.items.map((i) => i.slug));
  const today = todayISO();
  const next = schedule.events.find((e) => e.date >= today) ?? schedule.events[0] ?? null;
  const colorOf = (slug: string) => TONES[TONE_ORDER[Math.max(0, plan.items.findIndex((i) => i.slug === slug)) % 8]].tone;
  const missing = plan.items.filter((i) => i.frequency !== "as-needed" && !i.dose && !i.titration?.length);

  const exportIcs = () => {
    const out = scheduleToIcs(schedule);
    if (!out.ok) return setIcsError(out.error);
    setIcsError(null);
    downloadText("mypeptideguide-protocol.ics", out.ics, "text/calendar;charset=utf-8");
  };

  return (
    <>
      <div className="wash-page">
        <Container className="pt-12 pb-10 sm:pt-16 sm:pb-12">
          <Eyebrow>Your protocol</Eyebrow>
          <Display size="lg" className="mt-4">
            {plan.items.length ? (
              <>
                Set it up, <Em>step by step.</Em>
              </>
            ) : (
              <>
                Your protocol is <Em>empty.</Em>
              </>
            )}
          </Display>
          <Lede className="mt-5">
            Four steps per compound: dose, when, prepare, where. Everything is pre-filled from published ranges where we can cite one, and everything
            is editable. The builder computes, warns and schedules. It doesn&rsquo;t choose.
          </Lede>
          {conflict && <IncomingBanner count={conflict.items.length} onAccept={acceptIncoming} onDismiss={dismissIncoming} />}
        </Container>
      </div>

      <Container className="-mt-2">
        {plan.items.length === 0 ? (
          <div className="max-w-[720px]">
            <Notice compact />
            <p className="measure mt-8 mb-0 text-[16px] leading-[1.6] text-body">Start with the guide for an evidence-sorted shortlist, or add compounds straight from the library.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/guide" size="lg" arrow>
                Start the guide
              </Button>
              <Button href="/compounds" variant="secondary" size="lg">
                Browse the library
              </Button>
            </div>
            <div className="mt-8">
              <AddCompound compounds={compounds} exclude={inPlan} onAdd={(c) => save({ items: [defaultItem(c)] })} />
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
            {/* Steps */}
            <div className="flex min-w-0 flex-col gap-5">
              <Notice compact />

              <section style={toneStyle("blue")} className="tone-card p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="tone-icon shrink-0">
                    <CalendarDays size={20} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-[20px] font-bold tracking-[-0.02em] text-ink">Start date</h2>
                    <p className="mt-1 mb-0 text-[13px] text-body">Day one of every compound&rsquo;s first cycle. The calendar counts from here.</p>
                    <div className="mt-4 max-w-[240px]">
                      <Field label="First dose">
                        <DateField value={plan.startDate} onChange={(v) => save({ startDate: v })} />
                      </Field>
                    </div>
                  </div>
                </div>
              </section>

              {plan.items.map((item, i) => {
                const c = bySlug.get(item.slug);
                return c ? (
                  <CompoundSteps
                    key={item.slug}
                    c={c}
                    item={item}
                    index={i}
                    events={schedule.events.filter((e) => e.slug === item.slug)}
                    warnings={warnings.filter((w) => w.slugs.includes(item.slug))}
                    onChange={(next) => setItem(i, next)}
                    onRemove={() => save({ items: plan.items.filter((_, j) => j !== i) })}
                  />
                ) : null;
              })}

              <AddCompound compounds={compounds} exclude={inPlan} onAdd={(c) => save({ items: [...plan.items, defaultItem(c)] })} />

              {warnings.length > 0 && (
                <section aria-labelledby="warn-h" style={toneStyle("orange")} className="tone-card p-6 sm:p-7">
                  <h2 id="warn-h" className="m-0 text-[20px] font-bold tracking-[-0.02em] text-ink">
                    {warnings.length === 1 ? "One thing to know before you continue" : `${warnings.length} things to know before you continue`}
                  </h2>
                  <p className="mt-1 mb-0 text-[13px] text-body">These don&rsquo;t block anything. You can go ahead. You just can&rsquo;t say you weren&rsquo;t told.</p>
                  <ul className="m-0 mt-4 list-none divide-y divide-line p-0">
                    {warnings.map((w) => (
                      <li key={w.title} className="flex gap-3 py-4">
                        <span aria-hidden="true" className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-orange" />
                        <div>
                          <div className="text-[15px] font-semibold text-ink">{w.title}</div>
                          <div className="mt-1 text-[14px] leading-[1.55] text-body">{w.body}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="hairline pt-6">
                <PlanActions plan={plan} knownSlugs={known} onImport={(p) => setPlan(p)} path="/protocol" />
                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
                  <span>
                    Saved in this browser only.{" "}
                    <Link href="/privacy" className="font-medium text-blue-deep hover:text-ink">
                      How your data is handled
                    </Link>
                  </span>
                  <button type="button" onClick={() => window.confirm("Clear this protocol from this browser? This can't be undone.") && setPlan(null)} className="cursor-pointer font-medium hover:text-magenta-deep">
                    Clear protocol
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky summary */}
            <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
              <section className="rounded-[22px] border border-line bg-paper p-6 shadow-lift">
                <div className="eyebrow">Your plan at a glance</div>
                <ul className="m-0 mt-4 list-none divide-y divide-line p-0">
                  {plan.items.map((item) => (
                    <li key={item.slug} className="flex items-start gap-3 py-3">
                      <span className="mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colorOf(item.slug) }} />
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-ink">{bySlug.get(item.slug)?.name}</div>
                        <div className="tnum text-[12.5px] leading-[1.5] text-body">{summaryOf(item)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="hairline tnum mt-2 grid grid-cols-2 gap-3 pt-4 text-[13px] text-body">
                  <div>
                    <div className="name text-[26px] leading-none text-ink">{schedule.events.length}</div>
                    doses
                  </div>
                  <div>
                    <div className="name text-[26px] leading-none text-ink">{warnings.length}</div>
                    things to know
                  </div>
                </div>
                {next && (
                  <div className="hairline mt-4 pt-4">
                    <div className="eyebrow">Next dose</div>
                    <div className="mt-3 grid grid-cols-[96px_1fr] items-center gap-3">
                      {next.site ? (
                        <BodyDiagram sites={next.route === "im" ? IM_SITES : SUBQ_SITES} next={next.site} tone={colorOf(next.slug)} caption={false} />
                      ) : (
                        <div />
                      )}
                      <div className="text-[13px] leading-[1.55] text-body">
                        <div className="text-[15px] font-semibold text-ink">{next.name}</div>
                        <div className="tnum">
                          {longDate(next.date)} · {next.time}
                        </div>
                        <div className="tnum">
                          {next.dose !== null ? formatDose(next.dose, next.unit) : "dose not set"}
                          {next.units !== null ? ` · ${fmt(next.units, 1)} units` : ""}
                        </div>
                        {next.site && <div className="font-medium text-ink">{next.site.label}</div>}
                      </div>
                    </div>
                  </div>
                )}
                {missing.length > 0 && <p className="mt-4 mb-0 text-[12.5px] text-orange-deep">No dose set for {missing.map((i) => bySlug.get(i.slug)?.name).join(", ")}.</p>}
              </section>

              <section style={toneStyle("blue")} className="tone-card p-6">
                <div className="eyebrow text-[var(--tone-deep)]">Put it on your calendar</div>
                <p className="mt-2 mb-4 text-[13px] leading-[1.55] text-body">Reminders in the calendar you already use, with dose, units and site.</p>
                <GoogleCalendarList events={gcal} compact />
                <div className="mt-3 flex flex-col gap-2">
                  <Button variant="secondary" onClick={exportIcs} className="w-full">
                    <Download size={16} aria-hidden="true" /> Apple / Outlook (.ics)
                  </Button>
                  {icsError && <p className="m-0 text-[12.5px] text-magenta-deep">{icsError}</p>}
                  <Button href="/calendar" variant="ink" className="w-full" arrow>
                    Open the full calendar
                  </Button>
                </div>
              </section>
            </aside>
          </div>
        )}
      </Container>
    </>
  );
}
