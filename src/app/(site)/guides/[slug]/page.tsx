import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ArrowLink, Column, Display, Notice } from "@/design/primitives";
import { getGuides } from "@/content/loader";
import { JsonLd, articleJsonLd, pageMeta } from "@/seo/meta";

const readyGuides = () => getGuides().filter((g) => g.ready && g.sections.length);

/** Each guide points at the tool that does what it describes. */
const TOOL: Record<string, { href: string; label: string }> = {
  recon: { href: "/calculators", label: "Run your numbers in the reconstitution calculator" },
  sites: { href: "/guide", label: "Build a plan. The calendar rotates sites for you" },
  labs: { href: "/glossary", label: "Look up the terms in the glossary" },
};

export function generateStaticParams() {
  return readyGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = readyGuides().find((x) => x.slug === slug);
  if (!g) return {};
  return pageMeta({ title: g.title, description: g.dek, path: `/guides/${g.slug}`, type: "article" });
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const g = readyGuides().find((x) => x.slug === slug);
  if (!g) notFound();
  const tool = TOOL[g.slug];

  return (
    <Column className="pt-10 sm:pt-14">
      <JsonLd data={articleJsonLd({ headline: g.title, description: g.dek, path: `/guides/${g.slug}` })} />
      <Link href="/guides" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body hover:text-ink">
        <ArrowLeft size={15} aria-hidden="true" /> All guides
      </Link>
      <div className="eyebrow mt-8 text-purple-deep">{g.tag}</div>
      <Display size="xl" className="mt-3">
        {g.title}
      </Display>
      <p className="measure mt-5 mb-0 text-[18px] leading-[1.6] text-body">{g.dek}</p>
      <div className="tnum mt-3 text-[13px] text-muted">{g.readMinutes} min read</div>

      <div className="mt-12 flex flex-col gap-10">
        {g.sections.map((s, i) => (
          <section key={s.heading} className="hairline pt-8">
            <div className="flex items-baseline gap-4">
              <span className="font-serif text-[15px] text-muted">0{i + 1}</span>
              <h2 className="m-0 font-serif text-[28px] leading-[1.1] text-ink">{s.heading}</h2>
            </div>
            <p className="measure mt-4 mb-0 text-[16px] leading-[1.75] text-body">{s.body}</p>
          </section>
        ))}
      </div>

      {tool && (
        <div className="hairline mt-12 pt-6">
          <ArrowLink href={tool.href}>{tool.label}</ArrowLink>
        </div>
      )}
      <Notice className="mt-10" />
    </Column>
  );
}
