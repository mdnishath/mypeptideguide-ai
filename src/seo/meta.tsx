import type { Metadata } from "next";

export const SITE = {
  name: "mypeptideguide.ai",
  url: "https://mypeptideguide.ai",
  tagline: "The honest peptide guide",
  description:
    "Answer eight questions and get an evidence-graded shortlist of peptides for your goal, then the dosing maths and a calendar for whatever you choose. Free. No account.",
} as const;

const SOCIAL_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` };

/**
 * Full per-page metadata. Next replaces (not merges) a parent's `openGraph`
 * and `twitter` objects, so every page sets all of them through here.
 */
export function pageMeta({
  title,
  description,
  path,
  type = "website",
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE.name,
      type,
      locale: "en_US",
      images: [SOCIAL_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [SOCIAL_IMAGE.url] },
  };
}

/** Structured data. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const faqJsonLd = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

export const articleJsonLd = ({
  headline,
  description,
  path,
  dateModified,
}: {
  headline: string;
  description: string;
  path: string;
  dateModified?: string | null;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline,
  description,
  mainEntityOfPage: `${SITE.url}${path}`,
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  ...(dateModified ? { dateModified } : {}),
});
