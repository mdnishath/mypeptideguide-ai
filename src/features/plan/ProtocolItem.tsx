"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import type { CompoundSummary, DoseUnit } from "@/core/schema";
import { FREQUENCIES } from "@/core/schema";
import { FREQUENCY_LABEL, INJECTED_ROUTES, ROUTE_LABEL } from "@/core/taxonomy";
import { concentration, drawMl, fmt, formatDose, formatRange, toMg, u100 } from "@/core/dose";
import { VIAL_SHELF_DAYS } from "@/core/plan/schedule";
import type { PlanItem } from "@/core/plan/plan";
import type { PlanWarning } from "@/core/plan/warnings";
import { GradeMark } from "@/design/primitives";
import { Field, NumberField, Segmented, SelectField, TimeField } from "./fields";

const PER_WEEK: Record<PlanItem["frequency"], number> = { daily: 7, eod: 3.5, "2x-week": 2, weekly: 1, "5-on-2-off": 5, "as-needed": 0 };

const convert = (v: number | null, from: DoseUnit, to: DoseUnit) => (v === null || from === to ? v : from === "mcg" ? v / 1000 : v * 1000);

/** One line that says everything: "0.25 → 2.4 mg · Weekly · SubQ · 12 wks · 10 units". */
function summaryOf(item: PlanItem) {
  const dose =
    item.titration?.length
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

function Reconstitution({ item, update }: { item: PlanItem; update: (p: Partial<PlanItem>) => void }) {
  const conc = concentration(item.vialMg, item.waterMl);
  const dose = item.titration?.[0]?.dose ?? item.dose;
  const doseMg = dose ? toMg(dose, item.unit) : 0;
  const ml = drawMl(doseMg, conc);
  const perVial = doseMg && item.vialMg ? Math.floor(item.vialMg / doseMg + 1e-9) : 0;
  const perWeek = PER_WEEK[item.frequency];
  const lastsDays = perVial && perWeek ? Math.round((perVial / perWeek) * 7) : 0;

  return (
    <div className="mt-8">
      <div className="eyebrow text-blue-deep">Reconstitution</div>
      <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-[1fr_1fr_1.4fr] sm:items-end">
        <Field label="Vial · mg">
          <NumberField value={item.vialMg} onChange={(v) => update({ vialMg: v })} placeholder="e.g. 5" />
        </Field>
        <Field label="BAC water · mL">
          <NumberField value={item.waterMl} onChange={(v) => update({ waterMl: v })} placeholder="e.g. 2" />
        </Field>
        <div className="pb-2">
          {ml ? (
            <p className="m-0 text-[13px] text-body">
              Draw to <b className="tnum name text-[30px] leading-none text-ink">{fmt(u100(ml), 1)}</b>{" "}
              <span className="text-[11px] font-semibold tracking-[0.1em] text-blue-deep uppercase">units</span>
              <span className="mt-1 block">
                {fmt(ml, 3)} mL · {fmt(conc, 3)} mg/mL · U-100{item.titration ? " · at the first step" : ""}
              </span>
            </p>
          ) : (
            <p className="m-0 text-[13px] leading-[1.5] text-muted">
              {conc ? "Enter a dose to see units to draw." : "Vial size and water in, concentration and units out."}
            </p>
          )}
        </div>
      </div>
      {perVial > 0 && (
        <p className="mt-3 mb-0 text-[13px] leading-[1.55] text-body">
          About {perVial} dose{perVial === 1 ? "" : "s"} per vial{lastsDays ? `, roughly ${lastsDays} days at this frequency` : ""}
          {item.titration ? " at the first step" : ""}.
          {lastsDays > VIAL_SHELF_DAYS && (
            <span className="text-orange-deep"> Reconstituted vials are usually treated as good for {VIAL_SHELF_DAYS} days refrigerated, so shelf life runs out first.</span>
          )}
        </p>
      )}
    </div>
  );
}

function Titration({ item, update }: { item: PlanItem; update: (p: Partial<PlanItem>) => void }) {
  const steps = item.titration ?? [];
  const set = (i: number, patch: Partial<{ week: number; dose: number }>) =>
    update({ titration: steps.map((s, j) => (j === i ? { ...s, ...patch } : s)).sort((a, b) => a.week - b.week) });
  return (
    <div className="mt-8">
      <div className="flex items-baseline gap-4">
        <div className="eyebrow text-blue-deep">Titration steps</div>
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
            <button
              type="button"
              aria-label={`Remove step ${i + 1}`}
              disabled={steps.length === 1}
              onClick={() => update({ titration: steps.filter((_, j) => j !== i) })}
              className="mb-2 cursor-pointer text-muted hover:text-magenta-deep disabled:opacity-30"
            >
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

export default function ProtocolItem({
  c,
  item,
  warnings,
  onChange,
  onRemove,
}: {
  c: CompoundSummary;
  item: PlanItem;
  warnings: PlanWarning[];
  onChange: (next: PlanItem) => void;
  onRemove: () => void;
}) {
  // Rows with nothing to enter start folded; a compound with no dose starts open.
  const [open, setOpen] = useState(item.dose === null && !item.titration?.length);
  const update = (patch: Partial<PlanItem>) => onChange({ ...item, ...patch });
  const cited = c.dosing.source ? c.dosing.reportedRange : null;
  const injected = INJECTED_ROUTES.includes(item.route);
  const other = item.unit === "mcg" ? "mg" : "mcg";
  const converted = convert(item.dose, item.unit, other);
  const setUnit = (unit: DoseUnit) =>
    update({
      unit,
      dose: convert(item.dose, item.unit, unit),
      titration: item.titration?.map((s) => ({ ...s, dose: convert(s.dose, item.unit, unit)! })) ?? null,
    });

  return (
    <section className="border-t border-line py-7">
      <div className="flex items-start gap-4">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="group min-w-0 flex-1 cursor-pointer text-left">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="m-0 name text-[28px] leading-none text-ink">{c.name}</h2>
            <GradeMark grade={c.evidenceGrade} size="sm" />
          </div>
          <p className={`tnum mt-2 mb-0 text-[14px] leading-[1.5] ${item.dose === null && !item.titration ? "text-orange-deep" : "text-body"}`}>
            {summaryOf(item)}
          </p>
          {warnings.length > 0 && (
            <ul className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
              {warnings.map((w) => (
                <li key={w.title} className="flex items-start gap-2 text-[13px] text-body">
                  <span aria-hidden="true" className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                  {w.title}
                </li>
              ))}
            </ul>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onRemove} aria-label={`Remove ${c.name}`} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-magenta-wash hover:text-magenta-deep">
            <Trash2 size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Collapse" : "Edit"}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line-2 px-3.5 text-[13px] font-medium text-ink hover:border-ink"
          >
            {open ? "Done" : "Edit"} <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="step-in mt-6">
          <p className="m-0 text-[13px] leading-[1.55] text-body">
            {cited ? (
              <>
                <span className="font-medium text-ink">Pre-filled from the reported range</span> ({formatRange(cited)}), a starting point from the
                literature, not a recommendation. Source: {c.dosing.source}.
              </>
            ) : (
              <>
                <span className="font-medium text-ink">No cited range on file</span>, so nothing is pre-filled. Enter the dose you&rsquo;ve decided on.
              </>
            )}{" "}
            <Link href={`/compounds/${c.slug}`} className="font-medium text-blue-deep hover:text-ink">
              Profile
            </Link>
          </p>

          <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {!item.titration && (
              <Field label={`Dose · ${item.unit}`} hint={converted ? `= ${fmt(converted, 4)} ${other}` : undefined}>
                <NumberField value={item.dose} onChange={(v) => update({ dose: v })} placeholder="Enter" />
              </Field>
            )}
            <div className="flex flex-col gap-2 pb-2">
              <span className="eyebrow">Unit</span>
              <Segmented label="Dose unit" value={item.unit} onChange={setUnit} options={[{ value: "mcg", label: "mcg" }, { value: "mg", label: "mg" }]} />
            </div>
            <Field label="Frequency">
              <SelectField value={item.frequency} onChange={(v) => update({ frequency: v })} options={FREQUENCIES.map((f) => ({ value: f, label: FREQUENCY_LABEL[f] }))} />
            </Field>
            <Field label="Route">
              <SelectField value={item.route} onChange={(v) => update({ route: v })} options={c.route.map((r) => ({ value: r, label: ROUTE_LABEL[r] }))} />
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

          {item.titration ? (
            <Titration item={item} update={update} />
          ) : (
            <button
              type="button"
              onClick={() => update({ titration: [{ week: 0, dose: item.dose ?? 1 }] })}
              className="mt-5 inline-flex cursor-pointer items-center gap-1 text-[13px] font-medium text-blue-deep hover:text-ink"
            >
              <Plus size={14} aria-hidden="true" /> Add titration steps
            </button>
          )}

          {injected && <Reconstitution item={item} update={update} />}
        </div>
      )}
    </section>
  );
}
