import Results from "@/features/guide/Results";
import { getPublishedCompounds } from "@/content/loader";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Your shortlist",
  description: "Compounds that fit your guide answers, sorted by evidence grade.",
  path: "/guide/results",
  noindex: true, // renders the visitor's own browser state
});

export default function ResultsPage() {
  return <Results compounds={getPublishedCompounds()} />;
}
