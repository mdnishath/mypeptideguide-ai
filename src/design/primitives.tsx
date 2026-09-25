import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { EvidenceGrade } from "@/core/schema";
import { GRADE_LABEL } from "@/core/taxonomy";

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

export function Container({ children, className = "", wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={`mx-auto w-full ${wide ? "max-w-[1280px]" : "max-w-[1120px]"} px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** A reading column, for pages that are mostly prose. */
export function Column({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[760px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
/* Type                                                                       */
/* -------------------------------------------------------------------------- */

/** "01 — Section name". The number is optional. */
export function Eyebrow({ n, children, tone = "muted" }: { n?: string; children: ReactNode; tone?: "muted" | "purple" | "blue" }) {
  const color = tone === "purple" ? "text-purple-deep" : tone === "blue" ? "text-blue-deep" : "text-muted";
  return (
    <div className={`eyebrow ${color}`}>
      {n && <span className="mr-3 font-serif text-[15px] font-normal tracking-normal text-ink normal-case">{n}</span>}
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
  return <em className="display-italic text-blue-deep">{children}</em>;
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
  primary: "bg-blue text-white hover:bg-blue-deep",
  secondary: "border border-line-2 bg-paper text-ink hover:border-ink",
  ink: "bg-ink text-paper hover:bg-[#2a2a2a]",
  quiet: "text-blue-deep hover:text-ink px-0",
} as const;

const SIZE = { lg: "h-13 px-7 text-[15px]", md: "h-11 px-5 text-[14px]", sm: "h-9 px-4 text-[13px]" } as const;

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
      <span className={`font-serif leading-none tracking-[-0.01em] text-ink ${size === "md" ? "text-[22px]" : "text-[18px]"}`}>
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
