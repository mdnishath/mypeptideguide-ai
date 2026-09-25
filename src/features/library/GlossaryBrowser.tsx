"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { GlossaryTerm } from "@/core/schema";
import { toneAt, toneStyle } from "@/design/tones";

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
  const letters = new Set(groups.map((g) => g.letter));

  return (
    <div>
      {/* Search pill + A–Z index */}
      <div className="rounded-[22px] border border-line bg-paper p-4 shadow-lift sm:p-5">
        <div className="flex h-12 items-center gap-3 rounded-full border border-line-2 bg-paper-2 px-5 focus-within:border-blue focus-within:bg-paper">
          <Search size={17} className="text-ghost" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search glossary terms"
            placeholder="Search: half-life, SubQ, titration…"
            className="min-w-0 flex-1 border-none bg-transparent text-[16px] text-ink outline-none"
          />
          <span className="tnum shrink-0 text-[13px] text-muted">
            {filtered.length} of {terms.length}
          </span>
        </div>
        <nav aria-label="Jump to letter" className="mt-4 flex flex-wrap gap-1">
          {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((L) =>
            letters.has(L) ? (
              <a key={L} href={`#g-${L}`} className="tnum flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold text-ink hover:bg-blue hover:text-white">
                {L}
              </a>
            ) : (
              <span key={L} className="tnum flex h-8 w-8 items-center justify-center rounded-full text-[13px] text-line-2">
                {L}
              </span>
            ),
          )}
        </nav>
      </div>

      {groups.map((g, i) => (
        <section key={g.letter} id={`g-${g.letter}`} className="mt-10 scroll-mt-24 grid gap-x-8 sm:grid-cols-[72px_1fr]" style={toneStyle(toneAt(i))}>
          <div className="name flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tone-wash)] text-[30px] text-[var(--tone-deep)]">{g.letter}</div>
          <dl className="m-0 mt-4 border-b border-line sm:mt-0">
            {g.terms.map((t) => (
              <div key={t.term} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                <dt className="text-[16px] font-bold tracking-[-0.01em] text-ink">{t.term}</dt>
                <dd className="measure m-0 text-[15px] leading-[1.65] text-body">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {filtered.length === 0 && <p className="hairline mt-8 pt-6 text-[15px] text-body">No terms match that search.</p>}
    </div>
  );
}
