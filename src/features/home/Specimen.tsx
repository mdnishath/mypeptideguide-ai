import { CalendarDays } from "lucide-react";
import type { CompoundSummary } from "@/core/schema";
import { defaultItem, type Plan } from "@/core/plan/plan";
import { addDays, buildSchedule } from "@/core/plan/schedule";
import { fmt, formatRange } from "@/core/dose";
import { GradeMark } from "@/design/primitives";

const START = "2026-10-05"; // a Monday, fixed so the specimen never drifts between builds

/**
 * A real protocol line and calendar strip, rendered by the same code the
 * product uses. It's a specimen, not a screenshot — so it can never go stale.
 */
export default function Specimen({ compound }: { compound: CompoundSummary }) {
  const item = { ...defaultItem(compound), cycleWeeks: 12, vialMg: 5, waterMl: 2 };
  const plan: Plan = { v: 1, startDate: START, items: [item], currentlyTaking: [] };
  const schedule = buildSchedule(plan, new Map([[compound.slug, compound]]));
  const first = schedule.events[0];
  const range = compound.dosing.reportedRange!;
  const days = Array.from({ length: 35 }, (_, i) => addDays(START, i));
  const byDate = new Map(schedule.events.map((e) => [e.date, e]));
  const steps = item.titration ?? [];

  return (
    <figure className="m-0 overflow-hidden rounded-[var(--radius-panel)] border border-line bg-paper shadow-lift">
      <div className="grid md:grid-cols-[1.2fr_1fr]">
        {/* Protocol line */}
        <div className="border-b border-line p-6 md:border-r md:border-b-0 md:p-8">
          <div className="eyebrow">Protocol · specimen</div>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-serif text-[30px] leading-none text-ink">{compound.name}</span>
            <GradeMark grade={compound.evidenceGrade} size="sm" />
          </div>
          <p className="mt-3 mb-0 text-[13px] leading-[1.55] text-body">
            Pre-filled from the reported range <b className="font-medium text-ink">{formatRange(range)}, weekly</b>. From the
            label, not a recommendation. Every field editable.
          </p>
          <ol className="m-0 mt-5 flex list-none gap-1 p-0">
            {steps.map((s) => (
              <li key={s.week} className="flex-1 border-t-2 border-blue/30 pt-2 first:border-blue">
                <div className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">Wk {s.week + 1}</div>
                <div className="tnum text-[15px] font-medium text-ink">{fmt(s.dose, 2)} mg</div>
              </li>
            ))}
          </ol>
          <div className="hairline mt-5 flex items-baseline gap-2 pt-4 text-[13px] text-body">
            <span>
              {item.vialMg} mg vial + {item.waterMl} mL water
            </span>
            <span className="text-ghost">→</span>
            <span>
              draw to <b className="tnum font-serif text-[22px] text-ink">{fmt(first.units!, 1)}</b>{" "}
              <span className="text-[11px] font-semibold tracking-[0.1em] text-blue-deep uppercase">units</span>
            </span>
          </div>
        </div>

        {/* Calendar strip */}
        <div className="bg-paper-2 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="eyebrow">Calendar · October</div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-medium text-ink">
              <CalendarDays size={12} aria-hidden="true" /> .ics
            </span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="pb-1 text-center text-[10px] font-semibold text-muted">
                {d}
              </div>
            ))}
            {days.map((d) => {
              const ev = byDate.get(d);
              return (
                <div
                  key={d}
                  className={`tnum flex h-9 items-center justify-center rounded-lg text-[12px] ${
                    ev ? "bg-paper font-medium text-ink shadow-[inset_0_0_0_1px_var(--color-line)]" : "text-ghost"
                  }`}
                >
                  {Number(d.slice(8))}
                  {ev && <span aria-hidden="true" className={`ml-1 h-1.5 w-1.5 rounded-full ${ev.stepUp ? "bg-orange" : "bg-blue"}`} />}
                </div>
              );
            })}
          </div>
          <p className="mt-4 mb-0 text-[12.5px] leading-[1.5] text-body">
            <span className="font-medium text-ink">{first.name}</span> · {fmt(first.dose!, 2)} {first.unit} · {first.site?.label}.
            Reminder 15 min before, in your own calendar.
          </p>
        </div>
      </div>
    </figure>
  );
}
