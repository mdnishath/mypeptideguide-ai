import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { EvidenceGrade } from "@/core/schema";
import { GRADE_LABEL } from "@/core/taxonomy";

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

export function Container({ children, className = "", wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={`mx-auto w-full ${wide ? "max-w-[1440px]" : "max-w-[1280px]"} px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** A reading column, for pages that are mostly prose. */
export function Column({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[880px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** Inner-page header on a soft wash: eyebrow, display title, lede. */
export function PageHero({
  eyebrow,
  title,
  accent,
  children,
  aside,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="wash-page">
      <Container className="pt-12 pb-12 sm:pt-16 sm:pb-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <Display size="lg" className="mt-4">
              {title} {accent && <Em>{accent}</Em>}
            </Display>
            {children && <Lede className="mt-5">{children}</Lede>}
          </div>
          {aside}
        </div>
      </Container>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Type                                                                       */
/* -------------------------------------------------------------------------- */

/** "01 — Section name". The number is optional. */
export function Eyebrow({ n, children, tone = "purple" }: { n?: string; children: ReactNode; tone?: "muted" | "purple" | "blue" }) {
  const color = tone === "purple" ? "text-purple-deep" : tone === "blue" ? "text-blue-deep" : "text-muted";
  return (
    <div className={`eyebrow flex items-center gap-3 ${color}`}>
      {n ? (
        <span className="name bg-brand-cta flex h-7 w-7 items-center justify-center rounded-full text-[13px] tracking-normal text-white normal-case">{n}</span>
      ) : (
        <span aria-hidden="true" className="rule-brand h-[2px] w-6 rounded-full" />
      )}
      {children}
    </div>
  );
}

const DISPLAY = {
  xl: "text-[44px] sm:text-[64px] lg:text-[76px]",
  lg: "text-[36px] sm:text-[52px]",
  md: "text-[30px] sm:text-[40px]",
  sm: "text-[26px] sm:text-[30px]",
} as const;

/** Serif display heading. Wrap the key phrase in <Em> for the italic accent. */
export function Display({
  as: Tag = "h1",
  size = "lg",
  children,
  className = "",
}: {
  as?: "h1" | "h2" | "h3" | "p";
  size?: keyof typeof DISPLAY;
  children: ReactNode;
  className?: string;
}) {
  return <Tag className={`display m-0 text-ink ${DISPLAY[size]} ${className}`}>{children}</Tag>;
}

export function Em({ children }: { children: ReactNode }) {
  return <em className="display-italic text-brand">{children}</em>;
}

/** Playfair for compound names and headline figures. */
export function Name({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`name ${className}`}>{children}</span>;
}

export function Lede({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`measure m-0 text-[17px] leading-[1.6] text-body sm:text-[19px] ${className}`}>{children}</p>;
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer";

const VARIANT = {
  primary: "btn-primary text-white",
  secondary: "border border-line-2 bg-paper text-ink hover:border-ink hover:shadow-lift",
  ink: "bg-ink text-paper hover:bg-blue-deep",
  quiet: "text-blue-deep hover:text-ink px-0",
} as const;

const SIZE = { lg: "h-14 px-8 text-[15px] font-semibold", md: "h-11 px-6 text-[14px] font-semibold", sm: "h-9 px-4 text-[13px] font-semibold" } as const;

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
  arrow?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  arrow = false,
  disabled,
  type = "button",
  className = "",
}: ButtonProps) {
  const cls = `${base} ${VARIANT[variant]} ${variant === "quiet" ? "" : SIZE[size]} ${className}`;
  const inner = (
    <>
      {children}
      {arrow && <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />}
    </>
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Evidence                                                                   */
/* -------------------------------------------------------------------------- */

export const GRADE_COLOR: Record<EvidenceGrade, { dot: string; text: string; wash: string }> = {
  "human-rct": { dot: "bg-green", text: "text-green-deep", wash: "bg-green-wash" },
  animal: { dot: "bg-orange", text: "text-orange-deep", wash: "bg-orange-wash" },
  anecdotal: { dot: "bg-purple", text: "text-purple-deep", wash: "bg-purple-wash" },
};

/** A coloured dot and the grade name — the site's evidence mark. */
export function GradeMark({ grade, citations, size = "md" }: { grade: EvidenceGrade; citations?: number | null; size?: "sm" | "md" }) {
  const c = GRADE_COLOR[grade];
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${c.text} ${size === "sm" ? "text-[12px]" : "text-[13px]"}`}>
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
      {GRADE_LABEL[grade]}
      {citations ? <span className="font-normal text-muted">· {citations} cited</span> : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Notices                                                                    */
/* -------------------------------------------------------------------------- */

/** 18+ / not-medical-advice, shown at the point of output. */
export function Notice({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <p role="note" className={`m-0 border-l-2 border-magenta pl-4 text-[13px] leading-[1.6] text-body ${className}`}>
      <span className="font-semibold text-ink">18+ · Educational only · Not medical advice.</span>{" "}
      {compact
        ? "This organises what you chose. It doesn't recommend anything. Talk to a clinician."
        : "This site explains published evidence and does the maths on what you choose. It never recommends a compound, a dose or a protocol. Many of these compounds aren't approved for human use, some are prescription-only and some are banned in sport. Talk to a clinician before taking anything."}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Brand                                                                      */
/* -------------------------------------------------------------------------- */

export function Wordmark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className="inline-flex flex-col gap-1">
      <span className={`font-bold leading-none tracking-[-0.04em] text-ink ${size === "md" ? "text-[18px] sm:text-[21px]" : "text-[17px]"}`}>
        mypeptideguide<span className="text-blue">.ai</span>
      </span>
      <span aria-hidden="true" className="rule-brand h-[2px] w-full rounded-full" />
    </span>
  );
}

/** A quiet link with an arrow. */
export function ArrowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-1.5 text-[14px] font-medium text-blue-deep hover:text-ink ${className}`}>
      {children}
      <ArrowRight size={15} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
