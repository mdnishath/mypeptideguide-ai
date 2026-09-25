import GlossaryBrowser from "@/features/library/GlossaryBrowser";
import { Container, PageHero } from "@/design/primitives";
import { getGlossary } from "@/content/loader";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Peptide glossary: the words, demystified",
  description: "Half-life, SubQ, titration, reconstitution, lipohypertrophy: the vocabulary of peptide protocols, defined plainly.",
  path: "/glossary",
});

export default function GlossaryPage() {
  return (
    <>
      <PageHero eyebrow="Glossary" title="The words," accent="demystified.">
        Half-life, SubQ, titration, reconstitution: the vocabulary of peptide protocols, defined plainly.
      </PageHero>
      <Container className="-mt-4">
        <div className="max-w-[880px]">
          <GlossaryBrowser terms={getGlossary()} />
        </div>
      </Container>
    </>
  );
}
