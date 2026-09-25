"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import type { CompoundSummary, GoalSlug } from "@/core/schema";
import { GOAL_BY_SLUG } from "@/core/taxonomy";
import {
  CYCLE_OPTIONS,
  EMPTY_ANSWERS,
  EVIDENCE_OPTIONS,
  EXPERIENCE_OPTIONS,
  QUESTIONS,
  ROUTE_OPTIONS,
  isAnswered,
  type GuideAnswers,
} from "@/core/guide/questions";
import { KEYS, useStored, writeStored } from "@/state/store";
import { Button, Container, Display, Notice } from "@/design/primitives";
import FlowBar from "./FlowBar";
import { CheckRow, GoalGrid, OptionRows } from "./Options";

export type SavedGuide = { answers: GuideAnswers; step: number };
export const INITIAL_GUIDE: SavedGuide = { answers: EMPTY_ANSWERS, step: 0 };

/** Question 5: "nothing" or a searchable pick-list from the library. */
function CurrentlyTaking({
  compounds,
  answers,
  update,
}: {
  compounds: CompoundSummary[];
  answers: GuideAnswers;
  update: (patch: Partial<GuideAnswers>) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => compounds.filter((c) => !q || `${c.name} ${c.subtitle}`.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name)),
    [compounds, q],
  );
  const chosen = new Set(answers.currentlyTaking);
  const toggle = (slug: string) =>
    update({
      currentlyTaking: chosen.has(slug) ? answers.currentlyTaking.filter((s) => s !== slug) : [...answers.currentlyTaking, slug],
      nothingCurrent: false,
    });

  return (
    <div>
      <OptionRows
        label="Currently taking"
        options={[{ value: "nothing", label: "Nothing right now" }]}
        value={answers.nothingCurrent ? "nothing" : null}
        onPick={() => update({ nothingCurrent: !answers.nothingCurrent, currentlyTaking: [] })}
      />

      <div className="eyebrow mt-8">Or pick from the library</div>
      {answers.currentlyTaking.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {answers.currentlyTaking.map((slug) => {
            const c = compounds.find((x) => x.slug === slug);
            return c ? (
              <button
                key={slug}
                type="button"
                onClick={() => toggle(slug)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[13px] font-medium text-paper"
              >
                {c.name}
                <X size={13} aria-hidden="true" />
              </button>
            ) : null;
          })}
        </div>
      )}
      <div className="mt-3 flex h-12 items-center gap-3 border-b border-line-2">
        <Search size={17} className="text-ghost" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the library"
          placeholder="Search the library"
          className="min-w-0 flex-1 border-none bg-transparent text-[16px] text-ink outline-none"
        />
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {matches.map((c) => (
          <label key={c.slug} className="flex cursor-pointer items-center gap-3 border-b border-line py-3 hover:bg-paper-2">
            <input type="checkbox" checked={chosen.has(c.slug)} onChange={() => toggle(c.slug)} className="ml-2 h-4 w-4 accent-[var(--color-blue)]" />
            <span className="text-[15px] font-medium text-ink">{c.name}</span>
            <span className="truncate text-[13px] text-muted">{c.subtitle}</span>
          </label>
        ))}
        {matches.length === 0 && <p className="m-0 py-4 text-[14px] text-body">Nothing in the library matches.</p>}
      </div>
    </div>
  );
}

export default function GuideFlow({ compounds }: { compounds: CompoundSummary[] }) {
  const router = useRouter();
  const [saved, setSaved, hydrated] = useStored<SavedGuide>(KEYS.guide, INITIAL_GUIDE);
  const { answers } = saved;
  const step = Math.min(Math.max(saved.step, 0), QUESTIONS.length - 1);
  const q = QUESTIONS[step];
  const last = step === QUESTIONS.length - 1;
  const canNext = isAnswered(q.id, answers);
  const progress = ((step + (canNext ? 1 : 0)) / QUESTIONS.length) * 100;
  const advanceTimer = useRef<number | null>(null);

  // `/guide?goal=sleep` from a goal page: start fresh with that goal.
  useEffect(() => {
    const url = new URL(window.location.href);
    const goal = url.searchParams.get("goal") as GoalSlug | null;
    if (goal && GOAL_BY_SLUG[goal]) {
      writeStored(KEYS.guide, { answers: { ...EMPTY_ANSWERS, primaryGoal: goal }, step: 1 } satisfies SavedGuide);
      url.searchParams.delete("goal");
      window.history.replaceState(null, "", url);
    }
  }, []);

  const update = (patch: Partial<GuideAnswers>, nextStep = step) => setSaved({ answers: { ...answers, ...patch }, step: nextStep });

  const go = (to: number) => {
    if (to < 0 || to >= QUESTIONS.length) return;
    setSaved({ answers, step: to });
    window.scrollTo({ top: 0 });
  };

  /** Single-choice answers advance on their own, after the selection is visible. */
  const pickAndNext = (patch: Partial<GuideAnswers>) => {
    update(patch);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      writeStored(KEYS.guide, { answers: { ...answers, ...patch }, step: Math.min(step + 1, QUESTIONS.length - 1) } satisfies SavedGuide);
      window.scrollTo({ top: 0 });
    }, 240);
  };

  const finish = () => canNext && router.push("/guide/results");

  // Keyboard: 1–9 pick an option on list questions, Enter = next, ← = back.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (!canNext) return;
        if (last) router.push("/guide/results");
        else go(step + 1);
      } else if (e.key === "ArrowLeft") {
        go(step - 1);
      } else if (/^[1-9]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        const pick = { experience: EXPERIENCE_OPTIONS, routeComfort: ROUTE_OPTIONS, cycle: CYCLE_OPTIONS, evidence: EVIDENCE_OPTIONS }[
          q.id as "experience" | "routeComfort" | "cycle" | "evidence"
        ];
        if (pick && pick[n]) {
          const value = pick[n].value;
          if (q.id === "evidence") update({ evidence: value as GuideAnswers["evidence"] });
          else pickAndNext({ [q.id]: value } as Partial<GuideAnswers>);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, canNext, last, answers]);

  return (
    <>
      <FlowBar step={step + 1} total={QUESTIONS.length} progress={progress} />

      <Container className={`pt-10 pb-16 sm:pt-14 transition-opacity ${hydrated ? "opacity-100" : "opacity-0"}`}>
        <section key={q.id} aria-live="polite" className="step-in w-full max-w-[960px]">
          <div className="eyebrow text-purple-deep">{q.eyebrow}</div>
          <Display size="lg" className="mt-3">
            {q.title}
          </Display>
          {q.help && <p className="measure mt-4 mb-0 text-[16px] leading-[1.6] text-body">{q.help}</p>}

          <div className="mt-8">
            {q.id === "primaryGoal" && (
              <GoalGrid
                label={q.title}
                value={answers.primaryGoal}
                onPick={(g) => pickAndNext({ primaryGoal: g, secondaryGoal: answers.secondaryGoal === g ? null : answers.secondaryGoal })}
              />
            )}

            {q.id === "secondaryGoal" && (
              <>
                <GoalGrid label={q.title} value={answers.secondaryGoal} exclude={answers.primaryGoal} onPick={(g) => pickAndNext({ secondaryGoal: g })} />
                <button
                  type="button"
                  onClick={() => pickAndNext({ secondaryGoal: "none" })}
                  className={`mt-4 cursor-pointer text-[15px] font-medium underline-offset-4 hover:underline ${
                    answers.secondaryGoal === "none" ? "text-ink underline" : "text-blue-deep"
                  }`}
                >
                  No second goal, skip this
                </button>
              </>
            )}

            {q.id === "experience" && (
              <OptionRows label={q.title} options={EXPERIENCE_OPTIONS} value={answers.experience} onPick={(v) => pickAndNext({ experience: v })} />
            )}

            {q.id === "routeComfort" && (
              <OptionRows label={q.title} options={ROUTE_OPTIONS} value={answers.routeComfort} onPick={(v) => pickAndNext({ routeComfort: v })} />
            )}

            {q.id === "currentlyTaking" && <CurrentlyTaking compounds={compounds} answers={answers} update={update} />}

            {q.id === "cycle" && <OptionRows label={q.title} options={CYCLE_OPTIONS} value={answers.cycle} onPick={(v) => pickAndNext({ cycle: v })} />}

            {q.id === "evidence" && (
              <OptionRows label={q.title} options={EVIDENCE_OPTIONS} value={answers.evidence} onPick={(v) => update({ evidence: v })} />
            )}

            {q.id === "acknowledge" && (
              <div className="border-t border-line">
                <CheckRow checked={answers.adult} onChange={(v) => update({ adult: v })}>
                  I am 18 or older.
                </CheckRow>
                <CheckRow checked={answers.notAdvice} onChange={(v) => update({ notAdvice: v })}>
                  I understand this is educational information, not medical advice. The guide explains published evidence and does
                  arithmetic on what I choose. It doesn&rsquo;t tell me what to take, and I&rsquo;ll talk to a clinician before taking
                  anything.
                </CheckRow>
                <Notice className="mt-6" />
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => go(step - 1)}
              disabled={step === 0}
              className="inline-flex cursor-pointer items-center gap-1.5 text-[14px] font-medium text-body hover:text-ink disabled:invisible"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Back
            </button>
            <div className="flex items-center gap-4">
              <span className="hidden text-[12px] text-ghost sm:inline">
                {q.id === "acknowledge" || q.id === "currentlyTaking" || q.id.endsWith("Goal") ? "" : "Press a number, then Enter"}
              </span>
              {last ? (
                <Button onClick={finish} disabled={!canNext} size="lg" arrow>
                  See my shortlist
                </Button>
              ) : (
                <Button onClick={() => go(step + 1)} disabled={!canNext} size="lg" arrow variant={canNext ? "primary" : "secondary"}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
