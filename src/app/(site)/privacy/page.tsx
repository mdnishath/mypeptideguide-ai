import Prose from "@/design/Prose";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Privacy",
  description: "mypeptideguide.ai has no accounts and no database. Your answers and plan are stored only in your browser.",
  path: "/privacy",
});

/*
 * DRAFT, accurate to how this build behaves (no accounts, no database, no
 * analytics, localStorage only). Have it reviewed before launch, and update it
 * the moment analytics, a contact form or any third-party script is added.
 */
export default function PrivacyPage() {
  return (
    <Prose eyebrow="Privacy" title="Your data stays" accent="in your browser." updated="September 2026" lede="We designed the site so that we don't need your data, and we don't collect it.">
      <h2>What the site stores, and where</h2>
      <p>
        Your guide answers, your protocol and the doses you tick off are saved in your browser&rsquo;s local storage, on your device. They are
        not sent to us, and we have no database to put them in. There are no accounts.
      </p>
      <p>
        Clearing your browser&rsquo;s site data deletes all of it. Use &ldquo;Download JSON&rdquo; if you want a copy you control, or the
        shareable link to move a plan between devices.
      </p>
      <h2>Shareable links</h2>
      <p>
        A shareable link contains your plan encoded in the address itself. Anyone you give it to can see that plan. It doesn&rsquo;t contain
        your name or any contact details, but treat it as you would any personal note.
      </p>
      <h2>Calendar exports</h2>
      <p>
        The .ics file is created in your browser and downloaded directly. When you import it into Google, Apple or another calendar, that
        provider&rsquo;s privacy terms apply to what you&rsquo;ve imported.
      </p>
      <h2>Hosting</h2>
      <p>
        The site is hosted on Vercel. Like any web host, Vercel processes standard request information, such as IP address and browser type, to
        deliver pages and protect the service. We do not use it to identify or profile visitors.
      </p>
      <h2>Cookies and analytics</h2>
      <p>We don&rsquo;t set tracking cookies and don&rsquo;t run analytics or advertising scripts. The only thing we store is the local data described above.</p>
      <h2>Children</h2>
      <p>The site is for adults aged 18 and over.</p>
      <h2>Changes</h2>
      <p>If this changes, for example if we add analytics, we&rsquo;ll update this page before it happens.</p>
    </Prose>
  );
}
