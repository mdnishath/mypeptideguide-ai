"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CompoundSummary, EvidenceGrade } from "@/core/schema";
import { GRADE_LABEL } from "@/core/taxonomy";
import { GRADE_COLOR } from "@/design/primitives";
import CompoundRow from "./CompoundRow";

const GRADES: EvidenceGrade[] = ["human-rct", "animal", "anecdotal"];

export default function LibraryBrowser({ compounds }: { compounds: CompoundSummary[] }) {
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<EvidenceGrade | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return compounds.filter(
      (c) => (grade === "all" || c.evidenceGrade === grade) && (!q || `${c.name} ${c.subtitle} ${c.class} ${c.mechanismClass}`.toLowerCase().includes(q)),
    );
  }, [compounds, query, grade]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="flex h-12 min-w-[260px] flex-1 items-center gap-3 border-b border-line-2 focus-within:border-blue">
          <Search size={17} className="text-ghost" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search compounds"
            placeholder="Search by name, alias or class"
            className="min-w-0 flex-1 border-none bg-transparent text-[16px] text-ink outline-none"
          />
        </div>
        <div role="radiogroup" aria-label="Evidence grade" className="flex flex-wrap gap-2">
          <button
            type="button"
            role="radio"
            aria-checked={grade === "all"}
            onClick={() => setGrade("all")}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${grade === "all" ? "border-ink bg-ink text-paper" : "border-line-2 text-body hover:border-ink"}`}
          >
            All
          </button>
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={grade === g}
              onClick={() => setGrade(g)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                grade === g ? "border-ink bg-ink text-paper" : "border-line-2 text-body hover:border-ink"
              }`}
            >
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${GRADE_COLOR[g].dot}`} />
              {GRADE_LABEL[g]}
            </button>
          ))}
        </div>
      </div>

      <p className="tnum mt-4 mb-0 text-[13px] text-muted">
        {results.length === compounds.length ? `${compounds.length} compounds, strongest evidence first` : `${results.length} of ${compounds.length}`}
      </p>

      {results.length ? (
        <div className="mt-2 border-b border-line">
          {results.map((c) => (
            <CompoundRow key={c.slug} c={c} />
          ))}
        </div>
      ) : (
        <p className="hairline mt-4 pt-6 text-[15px] text-body">Nothing matches. Try another term, or clear the grade filter.</p>
      )}
    </div>
  );
}
