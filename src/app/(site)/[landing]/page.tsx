/**
 * The ten goal landing pages: /peptides-for-sleep, /peptides-for-weight-loss …
 * Real, indexable URLs assembled from the compound data.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CompoundRow from "@/features/library/CompoundRow";
import { Button, Container, Display, Em, Eyebrow, GRADE_COLOR, Lede, Notice } from "@/design/primitives";
import { GoalIcon } from "@/design/goalIcon";
import { getPublishedCompounds } from "@/content/loader";
import type { CompoundSummary, EvidenceGrade } from "@/core/schema";
import { GOALS, GRADE_LABEL, MECHANISM_LABEL, type Goal } from "@/core/taxonomy";
import { JsonLd, faqJsonLd, pageMeta } from "@/seo/meta";

export const dynamicParams = false;

const PREFIX = "peptides-for-";
const goalFor = (landing: string) => (landing.startsWith(PREFIX) ? GOALS.find((g) => g.landing === landing.slice(PREFIX.length)) : undefined);

export function generateStaticParams() {
  return GOALS.map((g) => ({ landing: `${PREFIX}${g.landing}` }));
}

export async function generateMetadata({ params }: PageProps<"/[landing]">): Promise<Metadata> {
  const { landing } = await params;
  const goal = goalFor(landing);
  if (!goal) return {};
  const n = getPublishedCompounds().filter((c) => c.goals.includes(goal.slug)).length;
  return pageMeta({
    title: `Peptides for ${goal.label.toLowerCase()}: what the evidence actually shows`,
    description: `${n} peptides and compounds used for ${goal.label.toLowerCase()}, graded by evidence: which have human trials, which are animal data only, and what each one's evidence doesn't show.`,
    path: `/${landing}`,
    type: "article",
  });
}

const SECTIONS: { grade: EvidenceGrade; heading: string; note: string }[] = [
  { grade: "human-rct", heading: "With human trials", note: "Controlled human studies exist. Read the catch for what they cover." },
  { grade: "animal", heading: "Animal data only", note: "The headline results are preclinical. Nothing controlled in people yet." },
  { grade: "anecdotal", heading: "Anecdotal", note: "Forums, clinic lore and unreplicated papers. Stated plainly." },
];

const list = (n: string[]) => (n.length <= 2 ? n.join(" and ") : `${n.slice(0, -1).join(", ")} and ${n.at(-1)}`);

function faqFor(goal: Goal, items: CompoundSummary[]) {
  const label = goal.label.toLowerCase();
  const rct = items.filter((c) => c.evidenceGrade === "human-rct").map((c) => c.name);
  const oral = items.filter((c) => c.route.some((r) => r === "oral" || r === "nasal" || r === "topical")).map((c) => c.name);
  const byClass = new Map<string, string[]>();
  for (const c of items) byClass.set(c.mechanismClass, [...(byClass.get(c.mechanismClass) ?? []), c.name]);
  const shared = [...byClass.entries()].filter(([, names]) => names.length > 1);
  return [
    {
      q: `Which peptides for ${label} have human trials behind them?`,
      a: rct.length
        ? `Of the ${items.length} compounds we cover for ${label}, ${rct.length} have controlled human studies: ${list(rct)}. Human trials usually cover a specific indication and population, so check each profile for what the trials actually tested.`
        : `None of the ${items.length} compounds we cover for ${label} have controlled human trials. The evidence is animal data or anecdotal, and each profile says which.`,
    },
    {
      q: `What is the best peptide for ${label}?`,
      a: "We don't answer that, on purpose. mypeptideguide.ai sorts compounds by the strength of their evidence and explains what each one's evidence does and doesn't show. The choice is yours, ideally with a clinician. Nothing here is a recommendation.",
    },
    {
      q: `Are there options for ${label} that aren't injected?`,
      a: oral.length
        ? `Yes: ${list(oral)} can be taken orally, nasally or topically. The guide's route question filters to these if you'd rather avoid injections.`
        : "Not among the compounds we cover. Every one of them is injected.",
    },
    {
      q: "Can these be combined?",
      a: shared.length
        ? `Some of them work the same way: ${shared.map(([cls, names]) => `${list(names)} are ${names.length === 2 ? "both" : "all"} ${MECHANISM_LABEL[cls] ?? "the same class"}`).join("; ")}. Two from one class hit the same receptor, and the protocol builder warns you if you select them together.`
        : "They work through different mechanisms, but that isn't the same as being safe together. The protocol builder flags compounds that act on the same hormonal axis.",
    },
  ];
}

export default async function GoalPage({ params }: PageProps<"/[landing]">) {
  const { landing } = await params;
  const goal = goalFor(landing);
  if (!goal) notFound();

  const items = getPublishedCompounds().filter((c) => c.goals.includes(goal.slug));
  const groups = SECTIONS.map((s) => ({ ...s, items: items.filter((c) => c.evidenceGrade === s.grade) })).filter((s) => s.items.length);
  const faq = faqFor(goal, items);
  const label = goal.label.toLowerCase();

  return (
    <>
      <JsonLd data={faqJsonLd(faq)} />
      <Container className="pt-12 sm:pt-16">
        <div className="max-w-[880px]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink">
              <GoalIcon goal={goal.slug} />
            </span>
            <Eyebrow>Peptides by goal</Eyebrow>
          </div>
          <Display size="xl" className="mt-5">
            Peptides for {label}: <Em>what the evidence shows.</Em>
          </Display>
          <Lede className="mt-6">{goal.intro}</Lede>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {groups.map((g) => (
              <span key={g.grade} className={`inline-flex items-center gap-2 text-[14px] font-medium ${GRADE_COLOR[g.grade].text}`}>
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${GRADE_COLOR[g.grade].dot}`} />
                {g.items.length} {GRADE_LABEL[g.grade].toLowerCase()}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={`/guide?goal=${goal.slug}`} size="lg" arrow>
              Narrow it down with the guide
            </Button>
            <Button href="/compounds" variant="secondary" size="lg">
              Full library
            </Button>
          </div>
          <Notice compact className="mt-8" />
        </div>
      </Container>

      {groups.map((s) => (
        <Container key={s.grade} className="mt-16">
          <div className="max-w-[880px]">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className={`m-0 inline-flex items-center gap-2.5 name text-[30px] text-ink`}>
                <span aria-hidden="true" className={`h-3 w-3 rounded-full ${GRADE_COLOR[s.grade].dot}`} />
                {s.heading}
              </h2>
              <span className="text-[14px] text-body">{s.note}</span>
            </div>
            <div className="mt-4 border-b border-line">
              {s.items.map((c) => (
                <CompoundRow key={c.slug} c={c} expanded />
              ))}
            </div>
          </div>
        </Container>
      ))}

      <Container className="mt-20">
        <div className="max-w-[880px]">
          <h2 className="m-0 name text-[30px] text-ink">Questions about peptides for {label}</h2>
          <dl className="m-0 mt-4">
            {faq.map((f) => (
              <div key={f.q} className="border-t border-line py-5">
                <dt className="text-[16px] font-semibold text-ink">{f.q}</dt>
                <dd className="measure m-0 mt-2 text-[15px] leading-[1.65] text-body">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <Container className="mt-16">
        <div className="hairline pt-6">
          <div className="eyebrow">Other goals</div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {GOALS.filter((g) => g.slug !== goal.slug).map((g) => (
              <Link key={g.slug} href={`/${PREFIX}${g.landing}`} className="text-[14px] font-medium text-body hover:text-blue-deep">
                Peptides for {g.label.toLowerCase()}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
