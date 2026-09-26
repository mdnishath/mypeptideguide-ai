"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import type { CompoundSummary } from "@/core/schema";
import { GOAL_BY_SLUG } from "@/core/taxonomy";
import { isComplete } from "@/core/guide/questions";
import { loosenWouldAdd, runGuide } from "@/core/guide/filter";
import { defaultItem, emptyPlan, type Plan } from "@/core/plan/plan";
import { KEYS, useStored } from "@/state/store";
import { Button, Container, Display, Em, GradeMark, Notice, Wordmark } from "@/design/primitives";
import { INITIAL_GUIDE, type SavedGuide } from "./GuideFlow";
import ResultRow from "./ResultRow";

const PHRASE = { "human-rct": "human trials", animal: "animal data only", anecdotal: "anecdotal evidence only" } as const;

export default function Results({ compounds }: { compounds: CompoundSummary[] }) {
  const router = useRouter();
  const [saved, setSaved, hydrated] = useStored<SavedGuide>(KEYS.guide, INITIAL_GUIDE);
  const [plan, setPlan] = useStored<Plan | null>(KEYS.plan, null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const { answers } = saved;

  const result = useMemo(() => runGuide(answers, compounds), [answers, compounds]);
  const loosen = useMemo(() => loosenWouldAdd(answers, compounds), [answers, compounds]);

  if (!hydrated) return <div className="min-h-[70vh]" />;

  if (!isComplete(answers)) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <Display size="md">Finish the guide first.</Display>
        <p className="measure mt-4 text-[16px] leading-[1.6] text-body">
          Your shortlist appears once all eight questions are answered, including the 18+ and not-medical-advice confirmation.
        </p>
        <Button href="/guide" size="lg" arrow className="mt-8">
          Continue the guide
        </Button>
      </Container>
    );
  }

  const goal = GOAL_BY_SLUG[answers.primaryGoal!];
  const secondary = answers.secondaryGoal && answers.secondaryGoal !== "none" ? GOAL_BY_SLUG[answers.secondaryGoal] : null;
  const n = result.shortlist.length;

  const grades = result.shortlist.reduce<Record<string, number>>((acc, c) => ((acc[c.evidenceGrade] = (acc[c.evidenceGrade] ?? 0) + 1), acc), {});
  const entries = Object.entries(grades);
  const summary =
    entries.length === 1
      ? `${entries[0][1] === 1 ? "It has" : `All ${entries[0][1]} have`} ${PHRASE[entries[0][0] as keyof typeof PHRASE]}.`
      : entries.map(([g, k]) => `${k} with ${PHRASE[g as keyof typeof PHRASE]}`).join(", ") + ".";

  const toggle = (slug: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const existing = plan?.items.length ? plan : null;
  const build = (mode: "replace" | "add") => {
    const base = mode === "add" && existing ? existing : { ...emptyPlan(), currentlyTaking: answers.currentlyTaking };
    const have = new Set(base.items.map((i) => i.slug));
    const added = compounds
      .filter((c) => picked.has(c.slug) && !have.has(c.slug))
      .map((c) => defaultItem(c, { cycle: answers.cycle, routeComfort: answers.routeComfort }));
    setPlan({
      ...base,
      items: [...base.items, ...added],
      currentlyTaking: Array.from(new Set([...base.currentlyTaking, ...answers.currentlyTaking])),
    });
    router.push("/protocol");
  };

  const setEvidence = (v: "human-only" | "include-preclinical") => setSaved({ answers: { ...answers, evidence: v }, step: saved.step });

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <Container>
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/" aria-label="mypeptideguide.ai home">
              <Wordmark size="sm" />
            </Link>
            <Link
              href="/guide"
              onClick={() => setSaved({ answers, step: 0 })}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body hover:text-ink"
            >
              <ArrowLeft size={15} aria-hidden="true" /> <span className="sm:hidden">Change</span>
              <span className="hidden sm:inline">Change my answers</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body hover:text-ink">
              Exit <X size={15} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </div>

      <Container className="pt-12 pb-32 sm:pt-16">
        <div className="mx-auto w-full max-w-[880px]">
          <div className="eyebrow text-purple-deep">Your shortlist · {goal.label}</div>
          <Display size="lg" className="mt-3">
            {n ? (
              <>
                {n} compound{n === 1 ? "" : "s"} fit <Em>your answers.</Em>
              </>
            ) : (
              <>
                Nothing fits <Em>every</Em> answer.
              </>
            )}
          </Display>
          {n > 0 && (
            <p className="measure mt-4 mb-0 text-[16px] leading-[1.6] text-body">
              {summary} Sorted by evidence, strongest first, never by popularity. Tick what you want to plan around. The guide
              doesn&rsquo;t choose for you.
            </p>
          )}
          <Notice className="mt-6" />

          {/* Question 7, still in reach */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-ink">Evidence</span>
            <div role="radiogroup" aria-label="Evidence" className="inline-flex rounded-full border border-line-2 p-0.5">
              {(
                [
                  ["human-only", "Human trials only"],
                  ["include-preclinical", "Include preclinical"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={answers.evidence === v}
                  onClick={() => setEvidence(v)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                    answers.evidence === v ? "bg-ink text-paper" : "text-body hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Shortlist */}
          {n > 0 ? (
            <div className="mt-8 border-b border-line">
              {result.shortlist.map((c) => (
                <ResultRow
                  key={c.slug}
                  c={c}
                  selected={picked.has(c.slug)}
                  onToggle={() => toggle(c.slug)}
                  alreadyTaking={answers.currentlyTaking.includes(c.slug)}
                  secondaryMatch={secondary && c.goals.includes(secondary.slug) ? secondary.label : null}
                />
              ))}
            </div>
          ) : (
            <div className="hairline mt-8 pt-8">
              <p className="measure m-0 text-[16px] leading-[1.6] text-body">
                No published compound for {goal.label.toLowerCase()} matches every answer you gave. We&rsquo;d rather say so than
                quietly widen the criteria.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {loosen.preclinical > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper-2 px-5 py-4">
                    <span className="text-[14.5px] text-body">
                      Including preclinical evidence adds <b className="font-semibold text-ink">{loosen.preclinical}</b> option{loosen.preclinical === 1 ? "" : "s"}, each clearly labelled.
                    </span>
                    <Button size="sm" onClick={() => setEvidence("include-preclinical")}>
                      Include preclinical
                    </Button>
                  </div>
                )}
                {loosen.injections > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper-2 px-5 py-4">
                    <span className="text-[14.5px] text-body">
                      Every option for {goal.label.toLowerCase()} that fits your other answers is injected. Allowing injections adds{" "}
                      <b className="font-semibold text-ink">{loosen.injections}</b>.
                    </span>
                    <Button size="sm" onClick={() => setSaved({ answers: { ...answers, routeComfort: "injection-ok" }, step: saved.step })}>
                      Allow injections
                    </Button>
                  </div>
                )}
                {loosen.preclinical === 0 && loosen.injections === 0 && (
                  <Button href="/guide" variant="secondary" className="self-start">
                    Change my answers
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Ruled out */}
          {result.ruledOut.length > 0 && (
            <details className="group mt-10">
              <summary className="flex cursor-pointer list-none items-center gap-3 py-4">
                <span className="flex-1">
                  <span className="block text-[17px] font-semibold text-ink">What we ruled out, and why ({result.ruledOut.length})</span>
                  <span className="mt-0.5 block text-[13.5px] text-body">Compounds filed under {goal.label.toLowerCase()} that your answers filtered away.</span>
                </span>
                <ChevronDown size={18} className="text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <ul className="m-0 list-none border-t border-line p-0">
                {result.ruledOut.map(({ compound: c, reasons }) => (
                  <li key={c.slug} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[200px_1fr] sm:gap-4">
                    <div>
                      <Link href={`/compounds/${c.slug}`} className="text-[15px] font-medium text-ink hover:text-blue-deep">
                        {c.name}
                      </Link>
                      <div className="mt-1">
                        <GradeMark grade={c.evidenceGrade} size="sm" />
                      </div>
                    </div>
                    <span className="text-[14px] leading-[1.55] text-body">{reasons.join(" · ")}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </Container>

      {/* Sticky action bar */}
      {n > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur">
          <Container>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 sm:min-h-[72px]">
              <span className="tnum basis-full text-[13px] text-body sm:basis-auto sm:flex-1 sm:text-[14px]">
                {picked.size ? (
                  <>
                    <b className="font-medium text-ink">{picked.size} selected</b>
                    {existing ? ` · you already have ${existing.items.length} in your protocol` : ""}
                  </>
                ) : (
                  "Tick at least one compound to build a protocol."
                )}
              </span>
              {existing && (
                <Button variant="secondary" onClick={() => build("replace")} disabled={!picked.size} className="whitespace-nowrap">
                  Start new
                </Button>
              )}
              <Button onClick={() => build(existing ? "add" : "replace")} disabled={!picked.size} arrow className="flex-1 whitespace-nowrap sm:flex-none">
                {existing ? "Add to my protocol" : "Build my protocol"}
              </Button>
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
