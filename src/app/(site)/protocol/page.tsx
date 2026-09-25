import Protocol from "@/features/plan/Protocol";
import { getPublishedCompounds } from "@/content/loader";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Protocol builder",
  description: "Dose, frequency, route and cycle for the compounds you chose, with reconstitution maths per compound and warnings for overlapping mechanisms.",
  path: "/protocol",
  noindex: true,
});

export default function ProtocolPage() {
  return <Protocol compounds={getPublishedCompounds()} />;
}
