import Link from "next/link";
import GoalPicker from "@/features/home/GoalPicker";
import Specimen from "@/features/home/Specimen";
import { ArrowLink, Button, Container, Display, Em, Eyebrow, GRADE_COLOR, Lede, Notice } from "@/design/primitives";
import { getPublishedCompounds } from "@/content/loader";
import { GRADE_LABEL } from "@/core/taxonomy";
import type { EvidenceGrade } from "@/core/schema";
import { JsonLd, faqJsonLd, pageMeta, SITE } from "@/seo/meta";

export const metadata = pageMeta({
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  path: "/",
});

const STEPS = [
  {
    title: "Answer eight questions",
    body: "Your goal, your experience, whether injections are an option, and how much evidence you want behind a compound. Two minutes.",
  },
  {
    title: "Choose from an honest shortlist",
    body: "Compounds that fit, strongest evidence first, plus what was ruled out and why. You tick what you want. The guide doesn't pick for you.",
  },
  {
    title: "Get the maths and a calendar",
    body: "Dose, frequency, cycle and reconstitution worked out per compound, then a dated schedule for your own calendar.",
  },
];

const GRADES: { grade: EvidenceGrade; text: string }[] = [
  { grade: "human-rct", text: "Controlled human studies exist, for the use that was studied." },
  { grade: "animal", text: "The headline results are preclinical. Nothing controlled in people yet." },
  { grade: "anecdotal", text: "Forums, clinic lore and unreplicated papers. Stated plainly." },
];

const FAQ = [
  {
    q: "Is this medical advice?",
    a: "No. mypeptideguide.ai explains published evidence and does arithmetic on what you choose. It never recommends a compound, a dose or a protocol. It's for adults (18+), and you should talk to a clinician about anything you plan to take.",
  },
  {
    q: "Why won't it just tell me what to take?",
    a: "Because it shouldn't. Most of these compounds aren't approved for the uses people are interested in, several are prescription-only and some are banned in sport. What we can do honestly is narrow the field, show what the evidence says for each option, including what it doesn't show, and handle the maths once you've decided.",
  },
  {
    q: "Where does my data live?",
    a: "In your browser, and nowhere else. Your answers, protocol and ticked-off doses are stored locally on your device. Move a plan to another device with the shareable link or a downloaded file. Clearing your browser data deletes it.",
  },
  {
    q: "How are the evidence grades decided?",
    a: "By the best published human evidence, not marketing. Human RCT means controlled human trials exist; Animal data only means the headline results are preclinical; Anecdotal means the record is forums, clinics and unreplicated papers. A dosing range only appears when we can cite where it comes from.",
  },
  {
    q: "Do I need an app or an account?",
    a: "No. Everything works in the browser, free. The calendar export puts reminders in the calendar you already use.",
  },
];

export default function HomePage() {
  const compounds = getPublishedCompounds();
  const specimen = compounds.find((c) => c.slug === "glp-1-s")!;
  const count = (g: EvidenceGrade) => compounds.filter((c) => c.evidenceGrade === g).length;

  return (
    <>
      <JsonLd data={faqJsonLd(FAQ)} />

      {/* ---------------------------------------------------------------- Hero */}
      <Container className="pt-16 sm:pt-24">
        <Eyebrow>Free · No account · Nothing stored on our servers · 18+</Eyebrow>
        <Display size="xl" className="mt-5 max-w-[16ch]">
          Which peptides have real evidence for <Em>your goal?</Em>
        </Display>
        <Lede className="mt-6">
          Pick a goal to start. Eight quick questions later you&rsquo;ll have a shortlist sorted by evidence, what we
          ruled out and why, and the maths for whatever you choose.
        </Lede>
        <div className="mt-10">
          <GoalPicker />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <ArrowLink href="/guide">Or start the guide from the beginning</ArrowLink>
          <Link href="/compounds" className="text-[14px] text-body hover:text-ink">
            Browse the library instead
          </Link>
        </div>
      </Container>

      {/* --------------------------------------------------------- How it works */}
      <Container className="mt-28">
        <div className="hairline pt-8">
          <Eyebrow n="01">How it works</Eyebrow>
          <Display as="h2" size="md" className="mt-4">
            You decide. <Em>It does the rest.</Em>
          </Display>
        </div>
        <ol className="m-0 mt-12 grid list-none gap-10 p-0 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="hairline pt-5">
              <span className="font-serif text-[40px] leading-none text-blue-deep">{i + 1}</span>
              <h3 className="mt-4 mb-0 text-[17px] font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 mb-0 text-[14.5px] leading-[1.65] text-body">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>

      {/* -------------------------------------------------------------- Grades */}
      <Container className="mt-28">
        <div className="hairline pt-8">
          <Eyebrow n="02">What honest means here</Eyebrow>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <Display as="h2" size="md">
              Three grades. <Em>No spin.</Em>
            </Display>
            <Lede className="text-[16px] sm:text-[17px]">
              Every compound carries one grade, based on the best published human evidence. Results are always sorted by
              it, never by popularity. A dosing figure only appears when we can cite where it comes from.{" "}
              <Link href="/editorial" className="font-medium text-blue-deep hover:text-ink">
                How we grade
              </Link>
            </Lede>
          </div>
        </div>
        <ul className="m-0 mt-10 list-none p-0">
          {GRADES.map(({ grade, text }) => (
            <li key={grade} className="hairline grid gap-2 py-5 sm:grid-cols-[220px_1fr_auto] sm:items-baseline">
              <span className={`inline-flex items-center gap-2 text-[16px] font-medium ${GRADE_COLOR[grade].text}`}>
                <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${GRADE_COLOR[grade].dot}`} />
                {GRADE_LABEL[grade]}
              </span>
              <span className="text-[15px] leading-[1.6] text-body">{text}</span>
              <span className="tnum text-[13px] text-muted">
                {count(grade)} of {compounds.length}
              </span>
            </li>
          ))}
        </ul>
      </Container>

      {/* ------------------------------------------------------------ Specimen */}
      <Container className="mt-28">
        <div className="hairline pt-8">
          <Eyebrow n="03">What you get</Eyebrow>
          <Display as="h2" size="md" className="mt-4">
            Real output, <Em>not a mockup.</Em>
          </Display>
          <Lede className="mt-4 text-[16px] sm:text-[17px]">
            Below is a protocol line and calendar strip rendered by the same code the product runs, for a compound with a
            published label schedule. Yours will look like this, for whatever you choose.
          </Lede>
        </div>
        <div className="mt-10">
          <Specimen compound={specimen} />
        </div>
        <Notice compact className="mt-6" />
      </Container>

      {/* ----------------------------------------------------------------- FAQ */}
      <Container className="mt-28">
        <div className="hairline pt-8 lg:grid lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div>
            <Eyebrow n="04">Fair questions</Eyebrow>
            <Display as="h2" size="md" className="mt-4">
              Asked <Em>often.</Em>
            </Display>
          </div>
          <dl className="m-0 mt-8 lg:mt-0">
            {FAQ.map((f) => (
              <div key={f.q} className="hairline py-5 first:border-t-0 first:pt-0">
                <dt className="text-[16px] font-semibold text-ink">{f.q}</dt>
                <dd className="m-0 mt-2 text-[14.5px] leading-[1.65] text-body">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      {/* ------------------------------------------------------------- Closing */}
      <Container className="mt-28">
        <div className="hairline flex flex-wrap items-center justify-between gap-6 pt-8">
          <Display as="p" size="sm">
            Two minutes. <Em>One honest shortlist.</Em>
          </Display>
          <Button href="/guide" size="lg" arrow>
            Start the guide
          </Button>
        </div>
      </Container>
    </>
  );
}
