import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AddToProtocol from "@/features/library/AddToProtocol";
import CitedDosing from "@/features/library/CitedDosing";
import CompoundRow from "@/features/library/CompoundRow";
import Bullets from "@/design/Bullets";
import { Column, Display, GradeMark, Notice } from "@/design/primitives";
import { getCompoundRecord, getPublishedCompounds } from "@/content/loader";
import { formatDose } from "@/core/dose";
import type { CompoundSummary } from "@/core/schema";
import { CLASS_LABEL, GOAL_BY_SLUG, GRADE_LABEL, ROUTE_LABEL } from "@/core/taxonomy";
import { JsonLd, articleJsonLd, faqJsonLd, pageMeta } from "@/seo/meta";

export function generateStaticParams() {
  return getPublishedCompounds().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/compounds/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompoundRecord(slug);
  if (!c) return {};
  return pageMeta({
    title: `${c.name}: what the evidence shows`,
    description: `${c.name} (${c.subtitle}), ${GRADE_LABEL[c.evidenceGrade]}. ${c.summary}`,
    path: `/compounds/${c.slug}`,
    type: "article",
  });
}

/** Same class counts double, a shared goal once. Top three. */
function related(c: CompoundSummary, all: CompoundSummary[]) {
  return all
    .filter((r) => r.slug !== c.slug)
    .map((r) => ({ r, score: (r.class === c.class ? 2 : 0) + (r.goals.some((g) => c.goals.includes(g)) ? 1 : 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.r.name.localeCompare(b.r.name))
    .slice(0, 3)
    .map((x) => x.r);
}

const reviewed = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="hairline mt-10 pt-8">
      <h2 className="m-0 font-serif text-[28px] leading-[1.1] text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function CompoundPage({ params }: PageProps<"/compounds/[slug]">) {
  const { slug } = await params;
  const c = getCompoundRecord(slug);
  if (!c) notFound();

  const p = c.profile;
  const cited = !!c.dosing.source && !!c.dosing.reportedRange;
  const trials = c.evidenceGrade === "human-rct" ? "Yes" : c.evidenceGrade === "animal" ? "No, animal models" : "Minimal, unreplicated";
  const facts: [string, string][] = [
    ["Category", CLASS_LABEL[c.class]],
    ["Type", c.subtitle],
    ["Administration", c.route.map((r) => ROUTE_LABEL[r]).join(" · ")],
    ["Human trials", trials],
    ...(c.halfLifeLabel ? ([["Half-life", c.halfLifeLabel]] as [string, string][]) : []),
  ];
  const path = `/compounds/${c.slug}`;
  const faq = p.faq.map(([q, a]) => ({ q, a }));
  const rel = related(c, getPublishedCompounds());

  return (
    <Column className="pt-10 sm:pt-14">
      <JsonLd data={articleJsonLd({ headline: `${c.name}: what the evidence shows`, description: c.summary, path, dateModified: c.reviewedOn })} />
      {faq.length > 0 && <JsonLd data={faqJsonLd(faq)} />}

      <Link href="/compounds" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body hover:text-ink">
        <ArrowLeft size={15} aria-hidden="true" /> All compounds
      </Link>

      <div className="mt-8">
        <GradeMark grade={c.evidenceGrade} citations={c.citationCount} />
      </div>
      <Display size="xl" className="mt-3">
        {c.name}
      </Display>
      <p className="mt-3 mb-0 text-[15px] text-muted">{c.subtitle}</p>
      <p className="measure mt-5 mb-0 text-[18px] leading-[1.6] text-body">{c.summary}</p>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        <span className="text-muted">Filed under</span>
        {c.goals.map((g) => (
          <Link key={g} href={`/peptides-for-${GOAL_BY_SLUG[g].landing}`} className="font-medium text-blue-deep hover:text-ink">
            {GOAL_BY_SLUG[g].label}
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <AddToProtocol compound={c} />
      </div>

      {/* Facts */}
      <dl className="hairline mt-10 grid grid-cols-2 gap-x-8 pt-2 sm:grid-cols-3 lg:grid-cols-5">
        {facts.map(([k, v]) => (
          <div key={k} className="border-b border-line py-3">
            <dt className="eyebrow">{k}</dt>
            <dd className="m-0 mt-1 text-[14px] font-medium leading-[1.4] text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {/* The catch */}
      <aside className="mt-10 border-l-2 border-orange pl-5">
        <div className="eyebrow text-orange-deep">What the evidence doesn&rsquo;t show</div>
        <p className="measure mt-2 mb-0 text-[16px] leading-[1.6] text-ink">{c.caveat}</p>
      </aside>

      <Section title={`What is ${c.name}?`}>
        <p className="measure m-0 text-[16px] leading-[1.75] text-body">{p.what}</p>
      </Section>
      {p.how && (
        <Section title={`How ${c.name} works`}>
          <p className="measure m-0 text-[16px] leading-[1.75] text-body">{p.how}</p>
        </Section>
      )}
      <Section title="What the research shows">
        {p.research ? <p className="measure m-0 text-[16px] leading-[1.75] text-body">{p.research}</p> : p.researchBullets && <Bullets bullets={p.researchBullets} />}
      </Section>

      <Section title="Dosing in published protocols">
        <CitedDosing c={c} className="text-[15px]" />
        {cited && c.dosing.titration && (
          <table className="mt-4 w-full max-w-[380px] border-collapse text-[14px]">
            <thead>
              <tr className="text-left">
                <th className="eyebrow border-b border-line py-2 font-semibold">From week</th>
                <th className="eyebrow border-b border-line py-2 font-semibold">Dose</th>
              </tr>
            </thead>
            <tbody>
              {c.dosing.titration.map((s) => (
                <tr key={s.week}>
                  <td className="tnum border-b border-line py-2 text-body">{s.week + 1}</td>
                  <td className="tnum border-b border-line py-2 font-medium text-ink">{formatDose(s.dose, c.dosing.reportedRange!.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {cited && p.dosage && <p className="measure mt-4 mb-0 text-[16px] leading-[1.75] text-body">{p.dosage}</p>}
        <p className="measure mt-4 mb-0 text-[13px] leading-[1.6] text-muted">
          Ranges are what published protocols report, not a recommended dose. The{" "}
          <Link href="/calculators" className="font-medium text-blue-deep hover:text-ink">
            calculators
          </Link>{" "}
          do the reconstitution maths for whatever you&rsquo;ve decided.
        </p>
      </Section>

      <Section title="Side effects and safety">
        <Bullets bullets={p.safety} />
      </Section>

      {faq.length > 0 && (
        <Section title="Frequently asked questions">
          <dl className="m-0">
            {faq.map(({ q, a }) => (
              <div key={q} className="border-b border-line py-4 first:pt-0">
                <dt className="text-[16px] font-semibold text-ink">{q}</dt>
                <dd className="measure m-0 mt-1.5 text-[15px] leading-[1.65] text-body">{a}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <Section title="References">
        {p.refs.length || c.dosing.source ? (
          <ol className="m-0 flex list-none flex-col p-0">
            {[...p.refs, ...(c.dosing.source ? [`Dosing: ${c.dosing.source}`] : [])].map((label, i) => (
              <li key={label} className="flex gap-4 border-b border-line py-3 text-[14px] leading-[1.55] text-ink">
                <span className="tnum w-5 shrink-0 font-serif text-muted">{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        ) : (
          <p className="m-0 text-[15px] text-body">The fully referenced version of this profile is in progress.</p>
        )}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4 text-[13px]">
          <Link href="/editorial#corrections" className="font-medium text-blue-deep hover:text-ink">
            Suggest a source or correction
          </Link>
          <span className="text-muted">{c.reviewedOn ? `Last reviewed ${reviewed(c.reviewedOn)}` : "Editorial review pending"}</span>
        </div>
      </Section>

      {rel.length > 0 && (
        <Section title="Related compounds">
          <div className="border-b border-line">
            {rel.map((r) => (
              <CompoundRow key={r.slug} c={r} />
            ))}
          </div>
        </Section>
      )}

      <Notice className="mt-12" />
    </Column>
  );
}
