import Link from "next/link";
import LibraryBrowser from "@/features/library/LibraryBrowser";
import { Container, Display, Em, Eyebrow, Lede } from "@/design/primitives";
import { GoalIcon } from "@/design/goalIcon";
import { getPublishedCompounds } from "@/content/loader";
import { GOALS } from "@/core/taxonomy";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Peptide library — every compound, graded honestly",
  description:
    "Peptides and related compounds with what they are, how they work and what the published evidence actually shows, graded Human RCT, Animal data only or Anecdotal. Never by marketing claims.",
  path: "/compounds",
});

export default function CompoundsPage() {
  const compounds = getPublishedCompounds();
  return (
    <Container className="pt-12 sm:pt-16">
      <Eyebrow>Compound library</Eyebrow>
      <Display size="lg" className="mt-4">
        Every compound, <Em>graded honestly.</Em>
      </Display>
      <Lede className="mt-5">
        {compounds.length} compounds: what each one is, how it works and what the published evidence actually shows. Grades reflect the best
        evidence available, never marketing claims, and every profile says plainly what the evidence doesn&rsquo;t show.
      </Lede>

      {/* Real, indexable URLs, not a client-side filter */}
      <section aria-labelledby="goals-h" className="hairline mt-12 pt-8">
        <h2 id="goals-h" className="eyebrow m-0">
          Browse by goal
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {GOALS.map((g) => (
            <Link key={g.slug} href={`/peptides-for-${g.landing}`} className="group flex items-center gap-3 bg-paper px-4 py-4 transition-colors hover:bg-blue-wash">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink group-hover:border-blue group-hover:text-blue-deep">
                <GoalIcon goal={g.slug} size={16} />
              </span>
              <span className="text-[14px] font-medium text-ink">{g.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="All compounds" className="mt-14">
        <LibraryBrowser compounds={compounds} />
      </section>
    </Container>
  );
}
