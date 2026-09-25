"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeftRight, FlaskConical, Hourglass, Layers, Repeat, Syringe, type LucideProps } from "lucide-react";
import { fmt, pf } from "@/core/dose";
import { Field, NumberField, Segmented } from "@/features/plan/fields";
import { toneStyle, type ToneKey } from "@/design/tones";

export function ToolCard({
  id,
  tone,
  icon: Icon,
  title,
  note,
  children,
  className = "",
}: {
  id: string;
  tone: ToneKey;
  icon: React.ComponentType<LucideProps>;
  title: string;
  note?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} style={toneStyle(tone)} className={`tone-card scroll-mt-24 p-6 sm:p-7 ${className}`}>
      <div className="flex items-start gap-4">
        <span className="tone-icon shrink-0">
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div>
          <h2 className="m-0 text-[20px] font-bold tracking-[-0.02em] text-ink">{title}</h2>
          {note && <p className="mt-1 mb-0 text-[13px] leading-[1.5] text-body">{note}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Big figure + unit + a line of context, on a tinted panel. */
export function Result({ value, unit, sub }: { value: string; unit?: string; sub?: string }) {
  return (
    <div className="result-panel mt-6 px-5 py-4">
      <div className="flex items-baseline gap-2">
        <span className="tnum name text-[40px] leading-none text-ink">{value}</span>
        {unit && <span className="text-[11px] font-bold tracking-[0.14em] text-[var(--tone-deep)] uppercase">{unit}</span>}
      </div>
      {sub && <p className="mt-2 mb-0 text-[13px] leading-[1.55] text-body">{sub}</p>}
    </div>
  );
}

export default function Calculators() {
  const [vial, setVial] = useState<number | null>(5);
  const [water, setWater] = useState<number | null>(2.5);
  const [dose, setDose] = useState<number | null>(250);

  const [uv, setUv] = useState<number | null>(250);
  const [uf, setUf] = useState<"mcg" | "mg">("mcg");

  const [sfDose, setSfDose] = useState<number | null>(250);
  const [sfConc, setSfConc] = useState<number | null>(2);

  const [hlDose, setHlDose] = useState<number | null>(200);
  const [hl, setHl] = useState<number | null>(2);
  const [hlT, setHlT] = useState<number | null>(6);

  const [cyOn, setCyOn] = useState<number | null>(8);
  const [cyOff, setCyOff] = useState<number | null>(4);

  const [blA, setBlA] = useState<number | null>(5);
  const [blB, setBlB] = useState<number | null>(5);
  const [blW, setBlW] = useState<number | null>(2);
  const [blDose, setBlDose] = useState<number | null>(300);

  const conc = pf(water) ? pf(vial) / pf(water) : 0;
  const rVol = conc ? pf(dose) / 1000 / conc : 0;
  const uvN = pf(uv);
  const sfVol = pf(sfConc) ? pf(sfDose) / 1000 / pf(sfConc) : 0;
  const hlReady = pf(hlDose) > 0 && pf(hl) > 0;
  const hlRem = pf(hlDose) * Math.pow(0.5, pf(hl) ? pf(hlT) / pf(hl) : 0);
  const cyTotal = pf(cyOn) + pf(cyOff);
  const blConcA = pf(blW) ? pf(blA) / pf(blW) : 0;
  const blVol = blConcA ? pf(blDose) / 1000 / blConcA : 0;
  const blCarry = pf(blW) ? blVol * (pf(blB) / pf(blW)) * 1000 : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
      <ToolCard id="reconstitution" tone="blue" icon={FlaskConical} title="Reconstitution" note="Vial + water + dose → units to draw on a U-100 syringe." className="lg:col-span-2">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
            <Field label="Vial · mg">
              <NumberField value={vial} onChange={setVial} />
            </Field>
            <Field label="BAC water · mL">
              <NumberField value={water} onChange={setWater} />
            </Field>
            <Field label="Dose · mcg">
              <NumberField value={dose} onChange={setDose} />
            </Field>
          </div>
          <div className="-mt-6">
            <Result
              value={rVol ? fmt(rVol * 100, 1) : "—"}
              unit="units"
              sub={rVol ? `= ${fmt(rVol, 3)} mL at ${fmt(conc, 3)} mg/mL. A record of your maths, not a dosing recommendation.` : "Enter vial, water and dose."}
            />
          </div>
        </div>
      </ToolCard>

      <ToolCard id="units" tone="cyan" icon={ArrowLeftRight} title="Unit converter">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Value">
            <NumberField value={uv} onChange={setUv} />
          </Field>
          <div className="pb-2">
            <Segmented label="Unit" value={uf} onChange={setUf} options={[{ value: "mcg", label: "mcg" }, { value: "mg", label: "mg" }]} />
          </div>
        </div>
        <Result value={uvN ? (uf === "mcg" ? fmt(uvN / 1000, 3) : fmt(uvN * 1000, 0)) : "—"} unit={uvN ? (uf === "mcg" ? "mg" : "mcg") : undefined} sub="1 mg = 1,000 mcg. A slip here is a thousand-fold error." />
      </ToolCard>

      <ToolCard id="syringe" tone="royal" icon={Syringe} title="Syringe fill">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <Field label="Dose · mcg">
            <NumberField value={sfDose} onChange={setSfDose} />
          </Field>
          <Field label="Conc · mg/mL">
            <NumberField value={sfConc} onChange={setSfConc} />
          </Field>
        </div>
        <Result value={sfVol ? fmt(sfVol * 100, 1) : "—"} unit="units" sub={sfVol ? `= ${fmt(sfVol, 3)} mL on a U-100 syringe.` : "Enter dose and concentration."} />
      </ToolCard>

      <ToolCard id="half-life" tone="purple" icon={Hourglass} title="Half-life">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
          <Field label="Dose · mcg">
            <NumberField value={hlDose} onChange={setHlDose} />
          </Field>
          <Field label="Half-life · h">
            <NumberField value={hl} onChange={setHl} />
          </Field>
          <Field label="Hours since">
            <NumberField value={hlT} onChange={setHlT} placeholder="0" />
          </Field>
        </div>
        <Result value={hlReady ? fmt(hlRem, 1) : "—"} unit="mcg" sub={hlReady ? `About ${Math.round((hlRem / pf(hlDose)) * 100)}% of the dose still circulating.` : "Enter dose, half-life and time."} />
      </ToolCard>

      <ToolCard id="cycles" tone="green" icon={Repeat} title="Cycle planner">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <Field label="Weeks on">
            <NumberField integer min={1} value={cyOn} onChange={setCyOn} />
          </Field>
          <Field label="Weeks off">
            <NumberField integer min={0} value={cyOff} onChange={setCyOff} placeholder="0" />
          </Field>
        </div>
        <Result value={cyTotal ? `${cyTotal}` : "—"} unit="week rhythm" sub={cyTotal ? `${pf(cyOn) * 7} dosing days, then ${pf(cyOff) * 7} days off before it repeats.` : "Enter weeks on and off."} />
      </ToolCard>

      <ToolCard id="blends" tone="orange" icon={Layers} title="Blend: two compounds, one vial" note="Dose is set by compound A; B rides along at the vial ratio." className="lg:col-span-2">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 lg:grid-cols-4">
            <Field label="Compound A · mg">
              <NumberField value={blA} onChange={setBlA} />
            </Field>
            <Field label="Compound B · mg">
              <NumberField value={blB} onChange={setBlB} />
            </Field>
            <Field label="BAC water · mL">
              <NumberField value={blW} onChange={setBlW} />
            </Field>
            <Field label="Dose of A · mcg">
              <NumberField value={blDose} onChange={setBlDose} />
            </Field>
          </div>
          <div className="-mt-6">
            <Result value={blVol ? fmt(blVol * 100, 1) : "—"} unit="units" sub={blVol ? `Carries about ${fmt(blCarry, 0)} mcg of compound B in the same draw.` : "Enter both vials, water and the A dose."} />
          </div>
        </div>
      </ToolCard>
    </div>
  );
}
