"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Check, ChevronDown, Plus, Trash2, X } from "lucide-react";
import type { CompoundSummary, DoseUnit } from "@/core/schema";
import { FREQUENCIES } from "@/core/schema";
import { FREQUENCY_LABEL, INJECTED_ROUTES, ROUTE_LABEL } from "@/core/taxonomy";
import { concentration, drawMl, fmt, formatDose, formatRange, toMg, u100 } from "@/core/dose";
import { IM_SITES, SUBQ_SITES, VIAL_SHELF_DAYS, type DoseEvent } from "@/core/plan/schedule";
import type { PlanItem } from "@/core/plan/plan";
import type { PlanWarning } from "@/core/plan/warnings";
import { GradeMark } from "@/design/primitives";
import { TONES, toneStyle, type ToneKey } from "@/design/tones";
import BodyDiagram from "@/features/calendar/BodyDiagram";
import SyringeGraphic from "./SyringeGraphic";
import { Field, NumberField, Segmented, SelectField, TimeField } from "./fields";

const PER_WEEK: Record<PlanItem["frequency"], number> = { daily: 7, eod: 3.5, "2x-week": 2, weekly: 1, "5-on-2-off": 5, "as-needed": 0 };
const convert = (v: number | null, from: DoseUnit, to: DoseUnit) => (v === null || from === to ? v : from === "mcg" ? v / 1000 : v * 1000);
const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/** "0.25 → 2.4 mg · Weekly · SubQ · 12 wks · 10 units" */
export function summaryOf(item: PlanItem) {
  const dose = item.titration?.length
    ? `${fmt(item.titration[0].dose, 3)} → ${fmt(item.titration.at(-1)!.dose, 3)} ${item.unit}`
    : item.dose !== null
      ? formatDose(item.dose, item.unit)
      : "dose not set";
  const conc = concentration(item.vialMg, item.waterMl);
  const first = item.titration?.[0]?.dose ?? item.dose;
  const ml = first && conc ? drawMl(toMg(first, item.unit), conc) : 0;
  const cycle = `${item.cycleWeeks} wk${item.cycleWeeks === 1 ? "" : "s"}${item.offWeeks ? ` on, ${item.offWeeks} off` : ""}${item.repeats > 1 ? ` × ${item.repeats}` : ""}`;
  return [dose, FREQUENCY_LABEL[item.frequency], ROUTE_LABEL[item.route], cycle, ml ? `${fmt(u100(ml), 1)} units` : null].filter(Boolean).join(" · ");
}

function Step({ n, title, done, children, tone }: { n: number; title: string; done: boolean; children: ReactNode; tone: string }) {
  return (
    <section className="grid gap-4 border-t border-line py-6 sm:grid-cols-[44px_1fr]">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold ${done ? "text-white" : "border border-line-2 bg-paper text-ink"}`}
        style={done ? { background: tone } : undefined}
        aria-label={done ? `Step ${n}, done` : `Step ${n}`}
      >
        {done ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : n}
      </span>
      <div className="min-w-0">
        <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em] text-ink">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}

function Titration({ item, update }: { item: PlanItem; update: (p: Partial<PlanItem>) => void }) {
  const steps = item.titration ?? [];
  const set = (i: number, patch: Partial<{ week: number; dose: number }>) =>
    update({ titration: steps.map((s, j) => (j === i ? { ...s, ...patch } : s)).sort((a, b) => a.week - b.week) });
  return (
    <div className="mt-5">
      <div className="flex items-baseline gap-4">
        <div className="eyebrow">Titration steps</div>
        <button type="button" onClick={() => update({ titration: null, dose: steps.at(-1)?.dose ?? item.dose })} className="cursor-pointer text-[12px] font-medium text-muted hover:text-magenta-deep">
          Remove steps
        </button>
      </div>
      <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-end gap-4">
            <div className="flex-1">
              <Field label="From week">
                <NumberField integer min={1} value={s.week + 1} onChange={(v) => v !== null && set(i, { week: v - 1 })} />
              </Field>
            </div>
            <div className="flex-1">
              <Field label={`Dose · ${item.unit}`}>
                <NumberField value={s.dose} onChange={(v) => v !== null && set(i, { dose: v })} />
              </Field>
            </div>
            <button type="button" aria-label={`Remove step ${i + 1}`} disabled={steps.length === 1} onClick={() => update({ titration: steps.filter((_, j) => j !== i) })} className="mb-2 cursor-pointer text-muted hover:text-magenta-deep disabled:opacity-30">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          const last = steps.at(-1);
          update({ titration: [...steps, { week: (last?.week ?? 0) + 4, dose: last?.dose ?? item.dose ?? 1 }] });
        }}
        className="mt-3 inline-flex cursor-pointer items-center gap-1 text-[13px] font-medium text-blue-deep hover:text-ink"
      >
        <Plus size={14} aria-hidden="true" /> Add a step
      </button>
    </div>
  );
}

export default function CompoundSteps({
  c,
  item,
  index,
  events,
  warnings,
  onChange,
  onRemove,
}: {
  c: CompoundSummary;
  item: PlanItem;
  index: number;
  /** This compound's scheduled doses, in order. */
  events: DoseEvent[];
  warnings: PlanWarning[];
  onChange: (next: PlanItem) => void;
  onRemove: () => void;
}) {
  const toneKey = (["blue", "purple", "green", "orange", "magenta", "cyan", "royal", "indigo"] as ToneKey[])[index % 8];
  const tone = TONES[toneKey].tone;
  const update = (patch: Partial<PlanItem>) => onChange({ ...item, ...patch });

  const injected = INJECTED_ROUTES.includes(item.route);
  const cited = c.dosing.source ? c.dosing.reportedRange : null;
  const hasDose = item.dose !== null || !!item.titration?.length;
  const conc = concentration(item.vialMg, item.waterMl);
  const firstDose = item.titration?.[0]?.dose ?? item.dose;
  const doseMg = firstDose ? toMg(firstDose, item.unit) : 0;
  const ml = drawMl(doseMg, conc);
  const units = ml ? Math.round(u100(ml) * 10) / 10 : null;
  const perVial = doseMg && item.vialMg ? Math.floor(item.vialMg / doseMg + 1e-9) : 0;
  const lastsDays = perVial && PER_WEEK[item.frequency] ? Math.round((perVial / PER_WEEK[item.frequency]) * 7) : 0;
  const prepared = !injected || (!!item.vialMg && !!item.waterMl);
  const doneCount = [hasDose, true, prepared, true].filter(Boolean).length;
  const complete = hasDose && prepared;

  const [open, setOpen] = useState(index === 0 || !complete);

  // Rotation preview: the first six distinct sites this compound will use.
  const sites = item.route === "im" ? IM_SITES : SUBQ_SITES;
  const order: Record<string, number> = {};
  for (const ev of events) {
    if (!ev.site || order[ev.site.id]) continue;
    order[ev.site.id] = Object.keys(order).length + 1;
    if (Object.keys(order).length >= 6) break;
  }
  const firstSite = events[0]?.site ?? null;
  const other = item.unit === "mcg" ? "mg" : "mcg";
  const converted = convert(item.dose, item.unit, other);
  const setUnit = (unit: DoseUnit) =>
    update({ unit, dose: convert(item.dose, item.unit, unit), titration: item.titration?.map((s) => ({ ...s, dose: convert(s.dose, item.unit, unit)! })) ?? null });

  return (
    <article style={toneStyle(toneKey)} className="tone-card">
      {/* Header */}
      <div className="flex items-start gap-4 p-6 sm:p-7">
        <span className="tone-icon shrink-0 text-[15px] font-bold">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="name m-0 text-[30px] leading-none text-ink">{c.name}</h2>
            <GradeMark grade={c.evidenceGrade} size="sm" />
          </div>
          <p className={`tnum mt-2 mb-0 text-[14px] leading-[1.5] ${hasDose ? "text-body" : "text-orange-deep"}`}>{summaryOf(item)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold">
            {(["Dose", "When", "Prepare", "Where"] as const).map((s, i) => {
              const done = [hasDose, true, prepared, true][i];
              return (
                <span key={s} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${done ? "bg-[var(--tone-wash)] text-[var(--tone-deep)]" : "border border-line-2 text-muted"}`}>
                  {done ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <span className="tnum">{i + 1}</span>} {s}
                </span>
              );
            })}
            <span className="tnum ml-1 text-muted">{doneCount}/4</span>
          </div>
          {warnings.length > 0 && (
            <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0">
              {warnings.map((w) => (
                <li key={w.title} className="flex items-start gap-2 text-[13px] text-body">
                  <span aria-hidden="true" className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                  {w.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onRemove} aria-label={`Remove ${c.name}`} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-magenta-wash hover:text-magenta-deep">
            <Trash2 size={16} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line-2 bg-paper px-3.5 text-[13px] font-semibold text-ink hover:border-ink">
            {open ? "Collapse" : complete ? "Review" : "Set up"} <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="step-in border-t border-line bg-paper px-6 pb-2 sm:px-7">
          {/* 1 · Dose */}
          <Step n={1} title="Dose" done={hasDose} tone={tone}>
            <p className="m-0 text-[13px] leading-[1.55] text-body">
              {cited ? (
                <>
                  <span className="font-semibold text-ink">Pre-filled from the reported range</span> ({formatRange(cited)}), a starting point from the literature, not a
                  recommendation. Source: {c.dosing.source}.
                </>
              ) : (
                <>
                  <span className="font-semibold text-ink">No cited range on file</span>, so nothing is pre-filled. Enter the dose you&rsquo;ve decided on.
                </>
              )}{" "}
              <Link href={`/compounds/${c.slug}`} className="font-medium text-blue-deep hover:text-ink">
                Profile
              </Link>
            </p>
            <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-[1fr_auto]">
              {!item.titration && (
                <Field label={`Dose · ${item.unit}`} hint={converted ? `= ${fmt(converted, 4)} ${other}` : undefined}>
                  <NumberField value={item.dose} onChange={(v) => update({ dose: v })} placeholder="Enter" />
                </Field>
              )}
              <div className="flex flex-col gap-2 pb-2">
                <span className="eyebrow">Unit</span>
                <Segmented label="Dose unit" value={item.unit} onChange={setUnit} options={[{ value: "mcg", label: "mcg" }, { value: "mg", label: "mg" }]} />
              </div>
            </div>
            {item.titration ? (
              <Titration item={item} update={update} />
            ) : (
              <button type="button" onClick={() => update({ titration: [{ week: 0, dose: item.dose ?? 1 }] })} className="mt-4 inline-flex cursor-pointer items-center gap-1 text-[13px] font-medium text-blue-deep hover:text-ink">
                <Plus size={14} aria-hidden="true" /> Add titration steps
              </button>
            )}
          </Step>

          {/* 2 · When */}
          <Step n={2} title="When" done tone={tone}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
              <Field label="Frequency">
                <SelectField value={item.frequency} onChange={(v) => update({ frequency: v })} options={FREQUENCIES.map((f) => ({ value: f, label: FREQUENCY_LABEL[f] }))} />
              </Field>
              <Field label="Time of day">
                <TimeField value={item.time} onChange={(v) => update({ time: v })} />
              </Field>
              <Field label="Weeks on">
                <NumberField integer min={1} value={item.cycleWeeks} onChange={(v) => v && update({ cycleWeeks: Math.min(v, 104) })} />
              </Field>
              <Field label="Weeks off" hint="0 if not cycling">
                <NumberField integer min={0} value={item.offWeeks} onChange={(v) => update({ offWeeks: Math.min(v ?? 0, 52) })} placeholder="0" />
              </Field>
              <Field label="Cycles">
                <NumberField integer min={1} value={item.repeats} onChange={(v) => v && update({ repeats: Math.min(v, 8) })} />
              </Field>
            </div>
            {events.length > 0 && (
              <p className="tnum mt-4 mb-0 text-[13px] text-body">
                <span className="font-semibold text-ink">{events.length} doses</span>, {longDate(events[0].date)} to {longDate(events[events.length - 1].date)}
                {item.titration ? `, stepping up ${item.titration.length - 1} time${item.titration.length === 2 ? "" : "s"}` : ""}.
              </p>
            )}
          </Step>

          {/* 3 · Prepare */}
          <Step n={3} title="Prepare" done={prepared} tone={tone}>
            {injected ? (
              <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
                <div>
                  <p className="m-0 text-[13px] leading-[1.55] text-body">Vial size and the water you add set the concentration. Units to draw follow from that.</p>
                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
                    <Field label="Vial · mg">
                      <NumberField value={item.vialMg} onChange={(v) => update({ vialMg: v })} placeholder="e.g. 5" />
                    </Field>
                    <Field label="BAC water · mL">
                      <NumberField value={item.waterMl} onChange={(v) => update({ waterMl: v })} placeholder="e.g. 2" />
                    </Field>
                  </div>
                  <div className="mt-5 flex flex-col gap-2">
                    <Field label="Route">
                      <SelectField value={item.route} onChange={(v) => update({ route: v })} options={c.route.map((r) => ({ value: r, label: ROUTE_LABEL[r] }))} />
                    </Field>
                  </div>
                </div>
                <div className="result-panel p-5">
                  <SyringeGraphic units={units} tone={tone} />
                  {ml ? (
                    <p className="mt-3 mb-0 text-[13px] leading-[1.6] text-body">
                      Draw to <b className="tnum name text-[28px] text-ink">{fmt(u100(ml), 1)}</b> <span className="text-[11px] font-bold tracking-[0.12em] text-[var(--tone-deep)] uppercase">units</span>
                      <span className="block">
                        {fmt(ml, 3)} mL at {fmt(conc, 3)} mg/mL{item.titration ? ", at the first step" : ""}.
                      </span>
                      {perVial > 0 && (
                        <span className="block">
                          About {perVial} dose{perVial === 1 ? "" : "s"} per vial{lastsDays ? `, ~${lastsDays} days` : ""}.
                          {lastsDays > VIAL_SHELF_DAYS && <span className="text-orange-deep"> Vials are usually good for {VIAL_SHELF_DAYS} days refrigerated, so shelf life runs out first.</span>}
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="mt-3 mb-0 text-[13px] text-muted">{hasDose ? "Enter vial and water to see the units." : "Set the dose first."}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[220px_1fr] sm:items-end">
                <Field label="Route">
                  <SelectField value={item.route} onChange={(v) => update({ route: v })} options={c.route.map((r) => ({ value: r, label: ROUTE_LABEL[r] }))} />
                </Field>
                <p className="m-0 pb-2 text-[13px] leading-[1.55] text-body">{ROUTE_LABEL[item.route]}: nothing to reconstitute or draw.</p>
              </div>
            )}
          </Step>

          {/* 4 · Where */}
          <Step n={4} title="Where" done tone={tone}>
            {injected && item.route !== "iv" ? (
              <div className="grid gap-6 sm:grid-cols-[220px_1fr] sm:items-center">
                <BodyDiagram sites={sites} next={firstSite} order={order} tone={tone} />
                <div>
                  <p className="m-0 text-[15px] leading-[1.6] text-ink">
                    First dose: <b className="font-semibold">{firstSite?.label ?? sites[0].label}</b>.
                  </p>
                  <p className="mt-2 mb-0 text-[13.5px] leading-[1.6] text-body">
                    Then it rotates, longest-rested site first, never the same spot twice in a row. The calendar names the site for every dose and the
                    .ics carries it into your reminders.
                  </p>
                  <ol className="m-0 mt-3 grid list-none grid-cols-2 gap-x-4 gap-y-1 p-0 text-[12.5px] text-body">
                    {Object.entries(order).map(([id, n]) => (
                      <li key={id} className="flex items-center gap-2">
                        <span className="tnum flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: tone }}>
                          {n}
                        </span>
                        {sites.find((s) => s.id === id)?.label}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <p className="m-0 text-[14px] leading-[1.6] text-body">{ROUTE_LABEL[item.route]}: no injection site to rotate.</p>
            )}
          </Step>
        </div>
      )}
    </article>
  );
}
