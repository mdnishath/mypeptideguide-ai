import Link from "next/link";
import Prose from "@/design/Prose";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "About",
  description: "mypeptideguide.ai is a free, web-only guide to the published evidence on peptides. It filters and explains; it never recommends.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Prose eyebrow="About" title="A guide that filters and explains." accent="You choose." lede="mypeptideguide.ai is a free, web-only guide to the published evidence on peptides and related compounds.">
      <p>
        People researching peptides usually meet two kinds of source: vendors who want to sell them something, and forums full of confident
        claims with nothing behind them. We built the thing we wanted to exist instead: a tool that narrows a large field down to what fits
        your goal, says plainly what the evidence shows for each option, and then does the arithmetic and the scheduling once you&rsquo;ve
        made up your own mind.
      </p>
      <h2>What it does</h2>
      <ul>
        <li>
          <Link href="/guide">The guide</Link> asks eight questions and returns a shortlist sorted by evidence grade, including what it ruled
          out and why.
        </li>
        <li>
          <Link href="/protocol">The protocol builder</Link> sets up whatever you selected: dose, frequency, route, cycle, titration and
          reconstitution maths, and warns about overlapping mechanisms.
        </li>
        <li>
          <Link href="/calendar">The calendar</Link> turns that into dated doses you can tick off, print, or export to Google or Apple
          Calendar.
        </li>
        <li>
          <Link href="/compounds">The library</Link>, <Link href="/calculators">calculators</Link>, <Link href="/guides">guides</Link> and{" "}
          <Link href="/glossary">glossary</Link> are the reference material behind it.
        </li>
      </ul>
      <h2>What it will never do</h2>
      <p>
        Tell you what to take. The site never recommends a compound, a dose or a protocol. Dosing figures appear only as ranges reported in
        published sources, with the source shown, and every figure is editable. Many of these compounds are not approved for the uses people
        are interested in; some are prescription-only; some are banned in sport. A tool that educates and organises is a very different thing
        from one that prescribes, and we intend to stay the former.
      </p>
      <h2>How it stays free</h2>
      <p>
        There are no accounts, no subscriptions and no servers holding your data, which keeps the running cost close to zero. We don&rsquo;t
        sell compounds and don&rsquo;t take payment to change a grade. Our <Link href="/editorial">editorial policy</Link> explains how the
        grades are set and how to report an error.
      </p>
    </Prose>
  );
}
