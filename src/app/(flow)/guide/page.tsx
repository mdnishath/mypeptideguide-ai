import GuideFlow from "@/features/guide/GuideFlow";
import { getPublishedCompounds } from "@/content/loader";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "The guide — eight questions to an honest shortlist",
  description:
    "Answer eight questions about your goal, experience and how much evidence you want. Get a shortlist of peptides sorted by evidence grade, with what was ruled out and why. Free, no account.",
  path: "/guide",
});

export default function GuidePage() {
  return <GuideFlow compounds={getPublishedCompounds()} />;
}
