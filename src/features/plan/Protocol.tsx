"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { CompoundSummary } from "@/core/schema";
import { defaultItem, emptyPlan, type Plan, type PlanItem } from "@/core/plan/plan";
import { planWarnings } from "@/core/plan/warnings";
import { usePlan } from "@/state/usePlan";
import { Button, Container, Display, Em, Notice } from "@/design/primitives";
import { DateField, Field } from "./fields";
import PlanActions, { IncomingBanner } from "./PlanActions";
import ProtocolItem from "./ProtocolItem";

function AddCompound({ compounds, exclude, onAdd }: { compounds: CompoundSummary[]; exclude: Set<string>; onAdd: (c: CompoundSummary) => void }) {
  const [slug, setSlug] = useState("");
  const options = compounds.filter((c) => !exclude.has(c.slug)).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-line py-6">
      <Plus size={18} className="text-blue-deep" aria-hidden="true" />
      <label htmlFor="add-compound" className="text-[15px] font-medium text-ink">
        Add a compound
      </label>
      <select
        id="add-compound"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="h-10 min-w-0 flex-1 cursor-pointer border-b border-line-2 bg-transparent text-[15px] text-ink outline-none focus:border-blue"
      >
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

  if (!hydrated) return <div className="min-h-[70vh]" />;

  const save = (patch: Partial<Plan>) => setPlan({ ...plan, ...patch });
  const setItem = (i: number, next: PlanItem) => save({ items: plan.items.map((it, j) => (j === i ? next : it)) });
  const inPlan = new Set(plan.items.map((i) => i.slug));
  const missing = plan.items.filter((i) => i.frequency !== "as-needed" && !i.dose && !i.titration?.length);

  return (
    <Container className="pt-12 sm:pt-16">
      <div className="mx-auto w-full max-w-[880px]">
        <div className="eyebrow text-purple-deep">Your protocol</div>
        <Display size="lg" className="mt-3">
          {plan.items.length ? (
            <>
              Set it up the way <Em>you&rsquo;ve decided.</Em>
            </>
          ) : (
            <>
              Your protocol is <Em>empty.</Em>
            </>
          )}
        </Display>
        <p className="measure mt-4 mb-0 text-[16px] leading-[1.6] text-body">
          Every field is editable. Where we can cite a published range it&rsquo;s pre-filled and labelled as such, a starting point,
          not a recommendation. The builder computes, warns and schedules. It doesn&rsquo;t choose.
        </p>

        {conflict && <IncomingBanner count={conflict.items.length} onAccept={acceptIncoming} onDismiss={dismissIncoming} />}
        <Notice compact className="mt-6" />

        {plan.items.length === 0 ? (
          <div className="hairline mt-10 pt-8">
            <p className="measure m-0 text-[16px] leading-[1.6] text-body">
              Start with the guide for an evidence-sorted shortlist, or add compounds straight from the library.
            </p>
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
          <>
            <div className="mt-10 grid gap-x-8 gap-y-2 sm:grid-cols-[220px_1fr] sm:items-end">
              <Field label="Start date">
                <DateField value={plan.startDate} onChange={(v) => save({ startDate: v })} />
              </Field>
              <p className="m-0 pb-2 text-[13px] text-body">Day one of every compound&rsquo;s first cycle. The calendar counts from here.</p>
            </div>

            {warnings.length > 0 && (
              <section aria-labelledby="warn-h" className="mt-10">
                <h2 id="warn-h" className="m-0 text-[17px] font-semibold text-ink">
                  {warnings.length === 1 ? "One thing to know" : `${warnings.length} things to know`}
                </h2>
                <p className="mt-1 mb-0 text-[13px] text-body">These don&rsquo;t block anything. You can go ahead. You just can&rsquo;t say you weren&rsquo;t told.</p>
                <ul className="m-0 mt-4 list-none border-t border-line p-0">
                  {warnings.map((w) => (
                    <li key={w.title} className="flex gap-3 border-b border-line py-4">
                      <span aria-hidden="true" className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-orange" />
                      <div>
                        <div className="text-[15px] font-medium text-ink">{w.title}</div>
                        <div className="mt-1 text-[14px] leading-[1.55] text-body">{w.body}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-10">
              {plan.items.map((item, i) => {
                const c = bySlug.get(item.slug);
                return c ? (
                  <ProtocolItem
                    key={item.slug}
                    c={c}
                    item={item}
                    warnings={warnings.filter((w) => w.slugs.includes(item.slug))}
                    onChange={(next) => setItem(i, next)}
                    onRemove={() => save({ items: plan.items.filter((_, j) => j !== i) })}
                  />
                ) : null;
              })}
              <AddCompound compounds={compounds} exclude={inPlan} onAdd={(c) => save({ items: [...plan.items, defaultItem(c)] })} />
            </div>

            <div className="hairline mt-4 pt-8">
              {missing.length > 0 && (
                <p className="mt-0 mb-4 text-[14px] text-orange-deep">
                  No dose set for {missing.map((i) => bySlug.get(i.slug)?.name).join(", ")}. Those doses will show on the calendar without an amount
                  until you add one.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-5">
                <Button href="/calendar" size="lg" arrow>
                  Generate my calendar
                </Button>
                <button
                  type="button"
                  onClick={() => window.confirm("Clear this protocol from this browser? This can't be undone.") && setPlan(null)}
                  className="cursor-pointer text-[14px] font-medium text-muted hover:text-magenta-deep"
                >
                  Clear protocol
                </button>
              </div>
              <div className="mt-8">
                <PlanActions plan={plan} knownSlugs={known} onImport={(p) => setPlan(p)} path="/protocol" />
              </div>
              <p className="mt-2 mb-0 text-[13px] text-muted">
                Saved in this browser only.{" "}
                <Link href="/privacy" className="font-medium text-blue-deep hover:text-ink">
                  How your data is handled
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
