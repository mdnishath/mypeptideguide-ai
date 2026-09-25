import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Display, Em, Eyebrow, Lede } from "@/design/primitives";
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
    <Container className="pt-12 sm:pt-16">
      <Eyebrow>Guides</Eyebrow>
      <Display size="lg" className="mt-4">
        Practical, <Em>not promotional.</Em>
      </Display>
      <Lede className="mt-5">The mechanics of doing this carefully: reconstitution, labs, rotation. No hype, sources cited.</Lede>

      <div className="mt-12 max-w-[880px] border-b border-line">
        {ready.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="group grid gap-x-8 gap-y-2 border-t border-line py-7 sm:grid-cols-[160px_1fr_auto] sm:items-start">
            <div>
              <div className="eyebrow">{g.tag}</div>
              <div className="tnum mt-1 text-[12px] text-muted">{g.readMinutes} min read</div>
            </div>
            <div className="min-w-0">
              <h2 className="m-0 font-serif text-[26px] leading-[1.1] text-ink group-hover:text-blue-deep">{g.title}</h2>
              <p className="measure mt-2 mb-0 text-[15px] leading-[1.6] text-body">{g.dek}</p>
            </div>
            <ArrowRight size={18} className="hidden text-muted transition-transform group-hover:translate-x-1 group-hover:text-blue-deep sm:block sm:mt-1" aria-hidden="true" />
          </Link>
        ))}
      </div>

      {coming.length > 0 && (
        <section className="mt-12 max-w-[880px]">
          <div className="eyebrow">Coming next</div>
          <ul className="m-0 mt-3 grid list-none gap-x-8 gap-y-2 p-0 sm:grid-cols-2">
            {coming.map((g) => (
              <li key={g.slug} className="text-[14px] leading-[1.55] text-body">
                <b className="font-medium text-ink">{g.title}.</b> {g.dek}
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
