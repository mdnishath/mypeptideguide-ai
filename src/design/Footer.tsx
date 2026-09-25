import Link from "next/link";
import { GOALS } from "@/core/taxonomy";
import { Container, Wordmark } from "./primitives";

const COLUMNS: { heading: string; items: { label: string; href: string }[] }[] = [
  {
    heading: "Use",
    items: [
      { label: "Start the guide", href: "/guide" },
      { label: "My protocol", href: "/protocol" },
      { label: "My calendar", href: "/calendar" },
      { label: "Calculators", href: "/calculators" },
    ],
  },
  {
    heading: "Learn",
    items: [
      { label: "Compound library", href: "/compounds" },
      { label: "Guides", href: "/guides" },
      { label: "Glossary", href: "/glossary" },
      { label: "How we grade evidence", href: "/editorial" },
    ],
  },
  {
    heading: "About",
    items: [
      { label: "About", href: "/about" },
      { label: "Editorial policy", href: "/editorial" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer data-print="hide" className="mt-24 border-t border-line">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark size="sm" />
            <p className="measure mt-4 max-w-[300px] text-[13px] leading-[1.6] text-body">
              A free guide to the published evidence on peptides. It filters, explains and does the maths. You choose.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <div className="eyebrow">{col.heading}</div>
              <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-[14px] text-ink hover:text-blue-deep">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline mt-12 pt-6">
          <div className="eyebrow">Peptides by goal</div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {GOALS.map((g) => (
              <Link key={g.slug} href={`/peptides-for-${g.landing}`} className="text-[13px] text-body hover:text-blue-deep">
                Peptides for {g.label.toLowerCase()}
              </Link>
            ))}
          </div>
        </div>

        <div className="hairline mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 pt-6 text-[12px] text-muted">
          <span>© 2026 mypeptideguide.ai</span>
          <span className="flex-1">
            Educational only. Not a medical device, and nothing here is a recommendation to take any compound. 18+. Talk to
            a clinician.
          </span>
        </div>
      </Container>
    </footer>
  );
}
