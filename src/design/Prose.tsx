import type { ReactNode } from "react";
import { Column, Display, Em, Eyebrow, Lede } from "./primitives";

/** Shared layout for the about / editorial / privacy / terms pages. */
export default function Prose({
  eyebrow,
  title,
  accent,
  updated,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  updated?: string;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Column className="pt-12 sm:pt-16">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Display size="lg" className="mt-4">
        {title} {accent && <Em>{accent}</Em>}
      </Display>
      {lede && <Lede className="mt-5">{lede}</Lede>}
      {updated && <p className="mt-3 mb-0 text-[13px] text-muted">Last updated {updated}</p>}
      <div className="mt-10 flex flex-col gap-4 text-[16px] leading-[1.75] text-body [&_a]:font-medium [&_a]:text-blue-deep [&_a:hover]:text-ink [&_b]:font-medium [&_b]:text-ink [&_h2]:mt-8 [&_h2]:mb-0 [&_h2]:font-serif [&_h2]:text-[26px] [&_h2]:leading-[1.15] [&_h2]:text-ink [&_li]:mt-1.5 [&_p]:m-0 [&_ul]:m-0 [&_ul]:pl-5">
        {children}
      </div>
    </Column>
  );
}
