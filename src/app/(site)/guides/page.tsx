import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, PageHero } from "@/design/primitives";
import { toneAt, toneStyle } from "@/design/tones";
import { getGuides } from "@/content/loader";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Guides: practical, not promotional",
  description: "The mechanics of doing this carefully: reconstitution, reading a lab panel, injection-site rotation. No hype, sources cited.",
  path: "/guides",
});

export default function GuidesPage() {
  const guides = getGuides();
  const ready = guides.filter((g) => g.ready);
  const coming = guides.filter((g) => !g.ready);

  return (
    <>
      <PageHero eyebrow="Guides" title="Practical," accent="not promotional.">
        The mechanics of doing this carefully: reconstitution, labs, rotation. No hype, sources cited.
      </PageHero>

      <Container className="-mt-6">
        <div className="grid gap-4 md:grid-cols-3 lg:gap-5">
          {ready.map((g, i) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} style={toneStyle(toneAt(i))} className="tone-card group flex min-h-[300px] flex-col p-6 sm:p-7">
              <div className="flex items-start justify-between">
                <span className="name text-brand text-[52px] leading-none">0{i + 1}</span>
                <span className="eyebrow rounded-full bg-[var(--tone-wash)] px-3 py-1.5 text-[var(--tone-deep)]">{g.tag}</span>
              </div>
              <h2 className="mt-8 mb-0 text-[24px] leading-[1.15] font-bold tracking-[-0.02em] text-ink">{g.title}</h2>
              <p className="mt-3 mb-0 text-[14.5px] leading-[1.6] text-body">{g.dek}</p>
              <div className="mt-auto flex items-center justify-between pt-6 text-[13px]">
                <span className="tnum text-muted">{g.readMinutes} min read</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--tone-deep)]">
                  Read <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {coming.length > 0 && (
          <section className="mt-14">
            <div className="eyebrow">Coming next</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {coming.map((g, i) => (
                <div key={g.slug} style={toneStyle(toneAt(i + 3))} className="rounded-2xl border border-dashed border-line p-4">
                  <div className="eyebrow text-[var(--tone-deep)]">{g.tag}</div>
                  <div className="mt-2 text-[15px] font-semibold leading-[1.3] text-ink">{g.title}</div>
                  <p className="mt-1.5 mb-0 text-[12.5px] leading-[1.5] text-body">{g.dek}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
