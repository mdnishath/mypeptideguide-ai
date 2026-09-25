import type { MetadataRoute } from "next";
import { SITE } from "@/seo/meta";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pages that only render the visitor's own browser-stored plan.
      disallow: ["/guide/results", "/protocol", "/calendar"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
