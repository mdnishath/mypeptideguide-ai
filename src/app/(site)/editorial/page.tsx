import Prose from "@/design/Prose";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Editorial policy: how the evidence grades work",
  description: "How mypeptideguide.ai grades evidence (Human RCT, Animal data only, Anecdotal), when a dosing range is shown, and how to report an error or suggest a source.",
  path: "/editorial",
});

export default function EditorialPage() {
  return (
    <Prose eyebrow="Editorial policy" title="How we grade," accent="and what we won't do." updated="September 2026" lede="The evidence grade is the whole point of this site. This page explains how it's set and what would change it.">
      <h2>The three grades</h2>
      <p>
        Each compound gets one grade, based on the <b>best published human evidence</b> for it. Not the most-cited claim, and never the
        marketing.
      </p>
      <ul>
        <li>
          <b>Human RCT.</b> Randomised controlled trials in people exist. That doesn&rsquo;t mean the compound works for every use it&rsquo;s
          associated with; trials cover a specific indication and population, and each profile says what they tested.
        </li>
        <li>
          <b>Animal data only.</b> The headline results come from animal or cell studies. Human evidence, if any, is case reports or
          uncontrolled.
        </li>
        <li>
          <b>Anecdotal.</b> The record is forums, clinic practice and small or unreplicated studies. Where human studies exist but come from a
          single program that has never been independently reproduced, we grade anecdotal: reproducibility, not existence, is the bar.
        </li>
      </ul>
      <h2>Numbers need sources</h2>
      <p>
        A dosing range appears only when we can cite where it comes from, a prescribing label or a named trial, and the source is shown next
        to it. If we can&rsquo;t cite a figure, we don&rsquo;t show one, even when a &ldquo;community standard&rdquo; number is easy to find.
        Ranges are what published protocols report, never a recommended dose.
      </p>
      <h2>Every profile states its limits</h2>
      <p>
        Every compound carries a short line on what its evidence doesn&rsquo;t show, or the known trade-off. The guide also lists what it ruled
        out and why. We under-claim on purpose.
      </p>
      <h2>Independence</h2>
      <p>
        mypeptideguide.ai does not sell compounds, and grades are not for sale. If we ever enter a commercial relationship with anyone who
        sells peptides, it will be disclosed on this page, and it will not touch the grading.
      </p>
      <h2>Review dates</h2>
      <p>
        Each profile shows when it was last editorially reviewed. Where a profile says &ldquo;editorial review pending&rdquo;, the content
        has been drafted but not yet reviewed against its sources.
      </p>
      <h2 id="corrections" className="scroll-mt-24">
        Corrections and sources
      </h2>
      <p>
        If you think a grade is wrong, a figure is miscited, or a study is missing, we want to know, especially if it changes a grade in either
        direction. Send the compound, what you think is wrong, and a link to the source.
        {/* TODO(client): add the corrections email address before launch. */}
      </p>
    </Prose>
  );
}
