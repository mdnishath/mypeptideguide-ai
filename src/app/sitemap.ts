import type { MetadataRoute } from "next";
import { getGuides, getPublishedCompounds } from "@/content/loader";
import { GOALS } from "@/core/taxonomy";
import { SITE } from "@/seo/meta";

/**
 * Indexable pages only. /guide/results, /protocol and /calendar render the
 * visitor's own browser-stored plan, carry noindex, and are left out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE.url}${path}`;
  const core: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/guide"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/compounds"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/calculators"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/guides"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/glossary"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.3 },
    { url: url("/editorial"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];
  const goals = GOALS.map((g) => ({ url: url(`/peptides-for-${g.landing}`), changeFrequency: "monthly" as const, priority: 0.8 }));
  const compounds = getPublishedCompounds().map((c) => ({
    url: url(`/compounds/${c.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    ...(c.reviewedOn ? { lastModified: new Date(c.reviewedOn) } : {}),
  }));
  const guides = getGuides()
    .filter((g) => g.ready)
    .map((g) => ({ url: url(`/guides/${g.slug}`), changeFrequency: "monthly" as const, priority: 0.6 }));
  return [...core, ...goals, ...compounds, ...guides];
}
