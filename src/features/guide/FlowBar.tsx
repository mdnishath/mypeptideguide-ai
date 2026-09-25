import Link from "next/link";
import { X } from "lucide-react";
import { Container, Wordmark } from "@/design/primitives";

/** Slim top bar for the guide: progress line, wordmark, step counter, exit. */
export default function FlowBar({ step, total, progress }: { step: number; total: number; progress: number }) {
  return (
    <div className="sticky top-0 z-40 bg-paper/95 backdrop-blur">
      <div
        role="progressbar"
        aria-label="Guide progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
        className="h-[3px] w-full bg-line"
      >
        <div className="rule-brand h-full transition-[width] duration-500 ease-[var(--ease-out)]" style={{ width: `${progress}%` }} />
      </div>
      <Container>
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/" aria-label="mypeptideguide.ai home">
            <Wordmark size="sm" />
          </Link>
          <span className="tnum text-[13px] text-muted">
            {step} <span className="text-ghost">/</span> {total}
          </span>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body hover:text-ink">
            Save &amp; exit <X size={15} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
