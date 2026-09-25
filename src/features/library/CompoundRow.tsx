import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CompoundSummary } from "@/core/schema";
import { CLASS_LABEL, ROUTE_LABEL } from "@/core/taxonomy";
import { GradeMark } from "@/design/primitives";
import CitedDosing from "./CitedDosing";

/**
 * One compound as a hairline row. `expanded` adds the caveat and cited dosing,
 * for goal pages where the row is the content.
 */
export default function CompoundRow({ c, expanded = false }: { c: CompoundSummary; expanded?: boolean }) {
  return (
    <article className="group border-t border-line py-6">
      <Link href={`/compounds/${c.slug}`} className="grid gap-x-8 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <GradeMark grade={c.evidenceGrade} citations={c.citationCount} size="sm" />
          <h3 className="mt-1.5 mb-0 font-serif text-[26px] leading-none text-ink group-hover:text-blue-deep">{c.name}</h3>
          <div className="mt-1.5 text-[13px] text-muted">
            {c.subtitle} · {CLASS_LABEL[c.class]} · {c.route.map((r) => ROUTE_LABEL[r]).join(" / ")}
          </div>
          <p className="measure mt-3 mb-0 text-[15px] leading-[1.6] text-body">{c.summary}</p>
          {expanded && (
            <>
              <p className="mt-3 mb-0 flex items-start gap-2 text-[14px] leading-[1.55] text-body">
                <span aria-hidden="true" className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-orange" />
                <span>
                  <span className="font-medium text-ink">The catch.</span> {c.caveat}
                </span>
              </p>
              <CitedDosing c={c} className="mt-3" />
            </>
          )}
        </div>
        <span className="hidden text-muted transition-transform group-hover:translate-x-1 group-hover:text-blue-deep sm:block sm:pt-8">
          <ArrowRight size={18} aria-hidden="true" />
        </span>
      </Link>
    </article>
  );
}
