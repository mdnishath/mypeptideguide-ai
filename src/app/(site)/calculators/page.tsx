import Link from "next/link";
import type { ReactNode } from "react";
import Calculators from "@/features/calculators/Calculators";
import Glp1Titration from "@/features/calculators/Glp1Titration";
import { Container, Display, Em, Eyebrow, Lede, Notice } from "@/design/primitives";
import { getPublishedCompounds } from "@/content/loader";
import { JsonLd, articleJsonLd, faqJsonLd, pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Peptide calculators: reconstitution, units to draw and GLP-1 titration",
  description:
    "Free peptide calculators: reconstitution (vial + BAC water → units on a U-100 syringe), mcg/mg converter, syringe fill, half-life, cycle planner, two-compound blends and the semaglutide / tirzepatide titration schedule, with worked examples.",
  path: "/calculators",
});

const FAQ = [
  {
    q: "How many units is 250 mcg?",
    a: "It depends entirely on the concentration of your vial. At 2 mg/mL (a 5 mg vial with 2.5 mL of water), 250 mcg is 0.125 mL, which is 12.5 units on a U-100 syringe. At 2.5 mg/mL (5 mg with 2 mL) it is 0.1 mL, or 10 units. There is no single answer without the vial size and the water you added.",
  },
  {
    q: "How much bacteriostatic water should I add?",
    a: "Mathematically, any amount works: the peptide per dose doesn't change, only the volume it's dissolved in. The practical question is measurement. Choose a volume where your dose lands somewhere you can read accurately on your syringe, typically between about 5 and 50 units.",
  },
  {
    q: "Does adding more water weaken the dose?",
    a: "No. More water lowers the concentration, so you draw a larger volume for the same dose. The amount of peptide you inject stays the same as long as you recalculate the units.",
  },
  {
    q: "How long does a reconstituted vial last?",
    a: "Community convention treats about 3–4 weeks refrigerated as the sensible window for most peptides mixed with bacteriostatic water. The calendar on this site uses 28 days and flags when a vial is approaching it. Check any storage guidance that came with your vial.",
  },
  {
    q: "What is a U-100 syringe?",
    a: "An insulin syringe calibrated so that 100 units equals 1 mL: each unit is 0.01 mL. It's the standard for peptide dosing and what every calculator here assumes. U-40 syringes also exist; using one with U-100 maths gives 2.5 times the intended volume.",
  },
  {
    q: "Can I convert IU to mg?",
    a: "Only with a factor specific to that compound, because an international unit measures biological activity rather than mass. Somatropin, for example, is conventionally about 3 IU per mg. There is no general IU-to-mg conversion.",
  },
];

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="hairline pt-8">
      <Eyebrow n={n}>{title}</Eyebrow>
      <div className="mt-5 flex flex-col gap-4 text-[16px] leading-[1.75] text-body [&_b]:font-medium [&_b]:text-ink [&_ol]:m-0 [&_ol]:pl-5 [&_p]:m-0 [&_ul]:m-0 [&_ul]:pl-5">{children}</div>
    </section>
  );
}

function Worked({ children }: { children: ReactNode }) {
  return <div className="tnum rounded-[var(--radius-ctl)] bg-paper-2 px-5 py-4 text-[14.5px] leading-[1.9] text-ink [&_b]:font-semibold">{children}</div>;
}

export default function CalculatorsPage() {
  const compounds = getPublishedCompounds();
  const glp1 = [
    { key: "semaglutide", label: "Semaglutide", slug: "glp-1-s" },
    { key: "tirzepatide", label: "Tirzepatide", slug: "glp-1-gip-t" },
  ]
    .map((o) => ({ ...o, compound: compounds.find((c) => c.slug === o.slug)! }))
    .filter((o) => o.compound?.dosing.titration);

  return (
    <>
      <JsonLd data={articleJsonLd({ headline: "Peptide calculators: reconstitution, units to draw and titration", description: "How peptide dosing maths works, with worked examples.", path: "/calculators" })} />
      <JsonLd data={faqJsonLd(FAQ)} />

      <Container className="pt-12 sm:pt-16">
        <Eyebrow>Calculators</Eyebrow>
        <Display size="lg" className="mt-4">
          Your maths, <Em>checked.</Em>
        </Display>
        <Lede className="mt-5">
          Seven working tools. They record and verify what you chose. They never suggest what to take. Everything assumes a standard U-100
          insulin syringe.
        </Lede>

        <div className="mt-12 max-w-[880px]">
          <Calculators />
          <Glp1Titration options={glp1} />
          <Notice compact className="mt-8" />
        </div>
      </Container>

      <Container className="mt-24">
        <div className="max-w-[720px]">
          <Display as="h2" size="md">
            How the maths <Em>works.</Em>
          </Display>
          <nav aria-label="On this page" className="mt-6">
            <ol className="m-0 grid list-none gap-x-8 gap-y-1.5 p-0 text-[14px] sm:grid-cols-2">
              {[
                ["reconstitution", "Reconstitution, step by step"],
                ["syringe", "Reading a U-100 syringe"],
                ["units", "mcg, mg and IU"],
                ["half-life", "Half-life"],
                ["cycles", "Cycles and off-weeks"],
                ["blends", "Two compounds, one vial"],
                ["titration", "GLP-1 titration schedules"],
                ["mistakes", "The mistakes that matter"],
              ].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="font-medium text-blue-deep hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12 flex flex-col gap-12">
            <Section n="01" title="Reconstitution, step by step">
              <p>
                Most peptides arrive as a freeze-dried powder. To use one you add bacteriostatic (BAC) water, which turns a fixed amount of
                peptide into a solution with a known <b>concentration</b>. Every other number follows from that concentration, so it is worth
                getting right before anything else.
              </p>
              <p>There are three steps, and the reconstitution calculator does all of them:</p>
              <ol className="flex flex-col gap-1.5">
                <li>
                  <b>Concentration</b> = vial contents (mg) ÷ water added (mL).
                </li>
                <li>
                  <b>Volume per dose</b> = dose (converted to mg) ÷ concentration.
                </li>
                <li>
                  <b>Units to draw</b> = volume in mL × 100, on a U-100 syringe.
                </li>
              </ol>
              <Worked>
                5 mg vial + 2 mL BAC water → 5 ÷ 2 = <b>2.5 mg/mL</b>
                <br />
                dose 250 mcg = 0.25 mg → 0.25 ÷ 2.5 = <b>0.1 mL</b>
                <br />
                0.1 mL × 100 = <b>10 units</b>
              </Worked>
              <p>
                Notice that the water doesn&rsquo;t change the dose. Had you added 2.5 mL instead, the concentration would be 2 mg/mL and the
                same 250 mcg would be 12.5 units. More water, more volume, same peptide. That is also why the choice of water is about{" "}
                <b>measurability</b>: pick a volume where your dose falls somewhere you can read precisely, roughly 5 to 50 units. Our{" "}
                <Link href="/guides/recon" className="font-medium text-blue-deep hover:text-ink">
                  reconstitution guide
                </Link>{" "}
                covers the physical side: adding the water down the vial wall, not shaking, storage.
              </p>
            </Section>

            <Section n="02" title="Reading a U-100 syringe">
              <p>
                A U-100 insulin syringe is calibrated so that <b>100 units = 1 mL</b>, which makes each unit 0.01 mL. They come in three common
                sizes: 0.3 mL (30 units), 0.5 mL (50 units) and 1 mL (100 units). The smaller the syringe, the finer the markings. Many 0.3 mL
                syringes are marked in half units, which matters when your dose is 4.5 units rather than 45.
              </p>
              <p>
                If a calculation lands on a fraction you can&rsquo;t mark, that is a sign to change the water volume next time rather than to
                guess. Rounding 12.5 units to 12 is a 4% change; rounding 2.5 units to 2 is a 20% one.
              </p>
            </Section>

            <Section n="03" title="mcg, mg and IU">
              <p>
                One milligram is 1,000 micrograms. Doses for most peptides are written in mcg and vials are labelled in mg, so every calculation
                involves a conversion, and a slip here is a <b>thousand-fold</b> error, not a small one. The unit converter exists for exactly
                that check.
              </p>
              <p>
                International units (IU) are different in kind: they measure biological activity, not mass. Converting IU to mg needs a factor
                specific to that compound. Somatropin, for example, is conventionally about 3 IU per mg, and there is no general formula.
                Don&rsquo;t confuse IU with the &ldquo;units&rdquo; on an insulin syringe, which are simply hundredths of a millilitre.
              </p>
            </Section>

            <Section n="04" title="Half-life: how much is still circulating">
              <p>
                A compound&rsquo;s half-life is the time it takes for blood levels to fall by half. After one half-life, 50% remains; after two,
                25%; after three, 12.5%. After about five, only around 3% is left, which is why five half-lives is the usual rule of thumb for
                &ldquo;effectively cleared&rdquo;.
              </p>
              <Worked>
                200 mcg, half-life 2 h, 6 h later → 6 ÷ 2 = 3 half-lives
                <br />
                200 × 0.5³ = <b>25 mcg</b> (12.5%) still circulating
              </Worked>
              <p>
                Half-life is why dosing frequency differs so much between compounds: minutes for sermorelin, around a week for the weekly GLP-1
                agonists. The calculator uses simple first-order decay and ignores the time a subcutaneous dose takes to absorb, so treat it as an
                estimate of the shape, not a blood level.
              </p>
            </Section>

            <Section n="05" title="Cycles and off-weeks">
              <p>
                Many protocols run for a set number of weeks on, followed by weeks off. The off-weeks are part of the design, often intended to
                limit receptor desensitisation, not a lapse. The cycle planner shows the rhythm and counts dosing days: 8 weeks on and 4 off is a
                12-week rhythm with 56 dosing days.
              </p>
              <p>
                The{" "}
                <Link href="/protocol" className="font-medium text-blue-deep hover:text-ink">
                  protocol builder
                </Link>{" "}
                goes further: set weeks on, weeks off and the number of cycles per compound, and the calendar shades the off-weeks and marks where
                each cycle ends. It also warns if a plan runs longer than the longest published protocol we can cite.
              </p>
            </Section>

            <Section n="06" title="Two compounds, one vial">
              <p>
                When two peptides are reconstituted in the same vial, you can only set the dose of one of them. Draw enough for compound A and
                compound B comes along at whatever ratio the vial was mixed in. The blend calculator works out both.
              </p>
              <Worked>
                A 5 mg + B 5 mg in 2 mL → each at 2.5 mg/mL
                <br />
                300 mcg of A → 0.3 ÷ 2.5 = 0.12 mL = <b>12 units</b>
                <br />B in the same draw → 0.12 × 2.5 = <b>300 mcg</b>
              </Worked>
              <p>If you want different doses of the two, a blend can&rsquo;t give you that. The ratio is fixed when you mix it.</p>
            </Section>

            <Section n="07" title="GLP-1 titration schedules">
              <p>
                The weekly GLP-1 receptor agonists are never started at their full dose. Their prescribing labels step the dose up every four
                weeks so that nausea and other gastrointestinal effects have time to settle before the next increase. Semaglutide&rsquo;s label
                runs 0.25 → 0.5 → 1 → 1.7 → 2.4 mg; tirzepatide&rsquo;s starts at 2.5 mg and rises by 2.5 mg every four weeks to a maximum of
                15 mg.
              </p>
              <p>
                The titration calculator lays that schedule over real dates from your first dose. Labels allow staying on a step longer if side
                effects haven&rsquo;t settled, which is why &ldquo;weeks per step&rdquo; is editable, but not moving faster. Add a vial size and
                water volume and each step also shows the units to draw.
              </p>
            </Section>

            <Section n="08" title="The mistakes that matter">
              <ul className="flex flex-col gap-2">
                <li>
                  <b>Mixing up mcg and mg.</b> A thousand-fold error. Convert first, then calculate.
                </li>
                <li>
                  <b>Using a U-40 syringe with U-100 maths.</b> You would draw 2.5 times the intended volume.
                </li>
                <li>
                  <b>Forgetting the water volume.</b> A different volume from last time means different units for the same dose. Recalculate
                  every new vial.
                </li>
                <li>
                  <b>Rounding tiny doses.</b> Half a unit is a large fraction of a 3-unit dose. Adjust the water instead.
                </li>
                <li>
                  <b>Drawing from an old vial.</b> Note the date you reconstituted it. The calendar counts the 28 days for you.
                </li>
              </ul>
            </Section>
          </div>

          <section className="hairline mt-16 pt-8">
            <Eyebrow n="09">Calculator questions</Eyebrow>
            <dl className="m-0 mt-4">
              {FAQ.map((f) => (
                <div key={f.q} className="border-b border-line py-5">
                  <dt className="text-[16px] font-semibold text-ink">{f.q}</dt>
                  <dd className="measure m-0 mt-2 text-[15px] leading-[1.65] text-body">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </Container>
    </>
  );
}
