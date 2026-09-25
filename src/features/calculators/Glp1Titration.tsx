"use client";

import { useState } from "react";
import type { CompoundSummary } from "@/core/schema";
import { concentration, drawMl, fmt, u100 } from "@/core/dose";
import { addDays } from "@/core/plan/schedule";
import { todayISO } from "@/core/plan/plan";
import AddToProtocol from "@/features/library/AddToProtocol";
import { DateField, Field, NumberField, Segmented } from "@/features/plan/fields";

type Option = { key: string; label: string; compound: CompoundSummary };

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** Weekly GLP-1 dose-escalation over real dates, from the cited label schedule. */
export default function Glp1Titration({ options }: { options: Option[] }) {
  const [key, setKey] = useState(options[0].key);
  const [start, setStart] = useState(todayISO());
  const [weeksPerStep, setWeeksPerStep] = useState<number | null>(4);
  const [vialMg, setVialMg] = useState<number | null>(null);
  const [waterMl, setWaterMl] = useState<number | null>(null);

  const opt = options.find((o) => o.key === key)!;
  const steps = opt.compound.dosing.titration ?? [];
  const per = weeksPerStep ?? 4;
  const conc = concentration(vialMg, waterMl);

  return (
    <section id="titration" className="scroll-mt-24 border-t border-line py-8">
      <h2 className="m-0 name text-[26px] leading-none text-ink">GLP-1 titration schedule</h2>
      <p className="mt-2 mb-0 text-[13px] text-body">The weekly step-up from the prescribing label, laid over real dates.</p>

      <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr_1fr] lg:items-end">
        <div className="pb-2">
          <Segmented label="Schedule" value={key} onChange={setKey} options={options.map((o) => ({ value: o.key, label: o.label }))} />
        </div>
        <Field label="First dose">
          <DateField value={start} onChange={setStart} />
        </Field>
        <Field label="Weeks per step">
          <NumberField integer min={1} value={weeksPerStep} onChange={setWeeksPerStep} placeholder="4" />
        </Field>
        <Field label="Vial · mg (optional)">
          <NumberField value={vialMg} onChange={setVialMg} />
        </Field>
        <Field label="Water · mL (optional)">
          <NumberField value={waterMl} onChange={setWaterMl} />
        </Field>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[14px]">
          <thead>
            <tr className="text-left">
              {["Step", "Weeks", "Dates", "Weekly dose", conc ? "Draw (U-100)" : "Units"].map((h) => (
                <th key={h} className="eyebrow border-b border-line py-2 pr-4 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => {
              const from = addDays(start, i * per * 7);
              const last = i === steps.length - 1;
              const ml = conc ? drawMl(s.dose, conc) : 0;
              return (
                <tr key={i}>
                  <td className="tnum border-b border-line py-3 pr-4 name text-[18px] text-ink">{i + 1}</td>
                  <td className="tnum border-b border-line py-3 pr-4 text-body">{last ? `${i * per + 1}+` : `${i * per + 1}–${(i + 1) * per}`}</td>
                  <td className="border-b border-line py-3 pr-4 text-body">
                    {longDate(from)}
                    {last ? " onward" : ` – ${longDate(addDays(from, per * 7 - 1))}`}
                  </td>
                  <td className="tnum border-b border-line py-3 pr-4 font-medium text-ink">{fmt(s.dose, 2)} mg</td>
                  <td className="tnum border-b border-line py-3 text-body">
                    {ml ? (
                      <>
                        <b className="font-medium text-ink">{fmt(u100(ml), 1)} units</b> · {fmt(ml, 3)} mL
                      </>
                    ) : (
                      "add vial + water"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="measure mt-4 mb-0 text-[13px] leading-[1.6] text-body">
        Source: {opt.compound.dosing.source}. The label steps up every four weeks and allows staying on a step longer if side effects
        haven&rsquo;t settled, never faster. A record of the published schedule, not a dosing instruction.
      </p>
      <div className="mt-4">
        <AddToProtocol compound={opt.compound} />
      </div>
    </section>
  );
}
