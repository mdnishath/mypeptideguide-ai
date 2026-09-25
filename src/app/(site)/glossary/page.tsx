import GlossaryBrowser from "@/features/library/GlossaryBrowser";
import { Column, Display, Em, Eyebrow } from "@/design/primitives";
import { getGlossary } from "@/content/loader";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Peptide glossary: the words, demystified",
  description: "Half-life, SubQ, titration, reconstitution, lipohypertrophy: the vocabulary of peptide protocols, defined plainly.",
  path: "/glossary",
});

export default function GlossaryPage() {
  return (
    <Column className="pt-12 sm:pt-16">
      <Eyebrow>Glossary</Eyebrow>
      <Display size="lg" className="mt-4">
        The words, <Em>demystified.</Em>
      </Display>
      <div className="mt-10">
        <GlossaryBrowser terms={getGlossary()} />
      </div>
    </Column>
  );
}
