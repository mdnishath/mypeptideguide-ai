import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { CompoundSummary } from "@/core/schema";
import { CLASS_LABEL, ROUTE_LABEL } from "@/core/taxonomy";
import { GradeMark } from "@/design/primitives";
import CitedDosing from "@/features/library/CitedDosing";

export default function ResultRow({
  c,
  selected,
  onToggle,
  alreadyTaking,
  secondaryMatch,
}: {
  c: CompoundSummary;
  selected: boolean;
  onToggle: () => void;
  alreadyTaking: boolean;
  secondaryMatch: string | null;
}) {
  return (
    <article className={`grid gap-5 border-t border-line py-8 transition-colors sm:grid-cols-[1fr_auto] ${selected ? "bg-blue-wash/40" : ""}`}>
      <div className="min-w-0">
        <GradeMark grade={c.evidenceGrade} citations={c.citationCount} />
        <h2 className="mt-2 mb-0 font-serif text-[30px] leading-none text-ink">{c.name}</h2>
        <div className="mt-1.5 text-[13px] text-muted">
          {c.subtitle} · {CLASS_LABEL[c.class]} · {c.route.map((r) => ROUTE_LABEL[r]).join(" / ")}
        </div>

        {(alreadyTaking || secondaryMatch) && (
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-medium">
            {alreadyTaking && <span className="rounded-full bg-orange-wash px-2.5 py-1 text-orange-deep">You said you take this already</span>}
            {secondaryMatch && <span className="rounded-full bg-paper-2 px-2.5 py-1 text-body">Also filed under {secondaryMatch}</span>}
          </div>
        )}

        <p className="measure mt-4 mb-0 text-[15px] leading-[1.6] text-body">{c.summary}</p>
        <CitedDosing c={c} className="mt-3" />
        <p className="mt-3 mb-0 flex items-start gap-2 text-[14px] leading-[1.55] text-body">
          <span aria-hidden="true" className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-orange" />
          <span>
            <span className="font-medium text-ink">The catch.</span> {c.caveat}
          </span>
        </p>
        <Link href={`/compounds/${c.slug}`} className="mt-3 inline-block text-[14px] font-medium text-blue-deep hover:text-ink">
          Full profile →
        </Link>
      </div>

      <div className="sm:pt-1">
        <button
          type="button"
          aria-pressed={selected}
          onClick={onToggle}
          className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[14px] font-medium transition-colors ${
            selected ? "bg-ink text-paper" : "border border-line-2 bg-paper text-ink hover:border-ink"
          }`}
        >
          {selected ? <Check size={16} strokeWidth={2.5} aria-hidden="true" /> : <Plus size={16} strokeWidth={2.5} aria-hidden="true" />}
          {selected ? "Added" : "Add to protocol"}
        </button>
      </div>
    </article>
  );
}
