import Link from "next/link";
import Prose from "@/design/Prose";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Terms of use",
  description: "mypeptideguide.ai is educational information for adults. It is not medical advice and does not recommend any compound, dose or protocol.",
  path: "/terms",
});

/*
 * DRAFT, plain-language terms written from the brief. This is not legal
 * advice: have counsel review (governing law, liability wording, jurisdiction)
 * before launch.
 */
export default function TermsPage() {
  return (
    <Prose eyebrow="Terms of use" title="Educational information," accent="not medical advice." updated="September 2026" lede="By using mypeptideguide.ai you agree to these terms. Please read them. They're short.">
      <h2>Adults only</h2>
      <p>The site is for people aged 18 and over.</p>
      <h2>Not medical advice</h2>
      <p>
        Everything on this site is general educational information. It is not medical advice, diagnosis or treatment, and it does not create any
        clinician–patient relationship. The site never recommends that you take any compound, at any dose, on any schedule. Talk to a qualified
        clinician before taking anything, and seek urgent care for anything that feels like an emergency.
      </p>
      <h2>Regulatory status</h2>
      <p>
        Many compounds described here are not approved for human use in the way they are discussed, some are available only on prescription, and
        some are prohibited in competitive sport. Whether a compound is legal to buy, possess or use where you live is your responsibility to
        check.
      </p>
      <h2>The tools</h2>
      <p>
        The guide, protocol builder, calculators and calendar organise and do arithmetic on choices <b>you</b> make. Pre-filled figures are
        ranges reported in published sources, shown with those sources, and are not recommendations. Check every calculation against your own
        product labels; you are responsible for what you enter and how you use the results.
      </p>
      <h2>Accuracy</h2>
      <p>
        We work to keep the content accurate and cite our sources, but research changes and errors happen. The site is provided &ldquo;as
        is&rdquo;, without warranties of any kind. See our <Link href="/editorial">editorial policy</Link> for how to report a problem.
      </p>
      <h2>Limitation of liability</h2>
      <p>To the fullest extent permitted by law, mypeptideguide.ai is not liable for any loss or harm arising from use of the site or reliance on its content.</p>
      <h2>Your data</h2>
      <p>
        See the <Link href="/privacy">privacy page</Link>. In short: your data stays in your browser.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows when they last changed.</p>
    </Prose>
  );
}
