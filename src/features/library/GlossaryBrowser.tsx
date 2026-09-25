"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { GlossaryTerm } from "@/core/schema";

type Group = { letter: string; terms: GlossaryTerm[] };

function groupByLetter(entries: GlossaryTerm[]): Group[] {
  const groups: Group[] = [];
  for (const t of entries) {
    const letter = t.term[0].toUpperCase();
    const last = groups[groups.length - 1];
    if (!last || last.letter !== letter) groups.push({ letter, terms: [t] });
    else last.terms.push(t);
  }
  return groups;
}

export default function GlossaryBrowser({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return terms.filter((t) => !q || `${t.term} ${t.definition}`.toLowerCase().includes(q));
  }, [query, terms]);
  const groups = useMemo(() => groupByLetter(filtered), [filtered]);

  return (
    <div>
      <div className="flex items-end gap-6">
        <div className="flex h-12 flex-1 items-center gap-3 border-b border-line-2 focus-within:border-blue">
          <Search size={17} className="text-ghost" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search glossary terms"
            placeholder="Search: half-life, SubQ, titration…"
            className="min-w-0 flex-1 border-none bg-transparent text-[16px] text-ink outline-none"
          />
        </div>
        <span className="tnum shrink-0 pb-3 text-[13px] text-muted">
          {filtered.length} of {terms.length}
        </span>
      </div>

      {groups.map((g) => (
        <section key={g.letter} className="mt-10 grid gap-x-8 sm:grid-cols-[64px_1fr]">
          <div className="font-serif text-[40px] leading-none text-blue-deep">{g.letter}</div>
          <dl className="m-0 border-b border-line">
            {g.terms.map((t) => (
              <div key={t.term} className="border-t border-line py-4">
                <dt className="text-[16px] font-semibold text-ink">{t.term}</dt>
                <dd className="measure m-0 mt-1 text-[15px] leading-[1.65] text-body">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {filtered.length === 0 && <p className="hairline mt-8 pt-6 text-[15px] text-body">No terms match that search.</p>}
    </div>
  );
}
