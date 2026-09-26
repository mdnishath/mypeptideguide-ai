# mypeptideguide.ai

A free, web-only guide to the published evidence on peptides. The visitor picks a goal, answers
seven more questions, gets a shortlist sorted by evidence, chooses what they want, and the site
builds a protocol with the dosing and reconstitution maths worked out, plus a calendar they can
tick off, print, or export to Google/Apple Calendar.

**The rule behind every screen:** the guide filters and explains; the user chooses. It never
recommends a compound, a dose or a protocol.

Built to the *mypeptideguide.ai — v1 Web Build Brief*. Editorial work still open:
**[CONTENT-STATUS.md](CONTENT-STATUS.md)**.

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # core logic: filter, schedule, warnings, .ics, URL codec
npm run build    # typechecks, validates content/, prerenders every page
npm run lint
npm run e2e      # Playwright: full flow on Pixel 7 + desktop, no element past the viewport
                 # E2E_BASE=https://mypeptideguide-ai.vercel.app npm run e2e  → against production
node e2e/peek.mjs  # viewport screenshots of key mobile screens, into e2e/shots/
```

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript · Vitest · `ics` · `lucide-react`.
Deploys to Vercel as-is.

## Design concept: "Plain Evidence"

An editorial, journal-like system, designed from scratch for this product.

- **Type.** Instrument Serif for display and the italic accent phrase (`<Em>`); Instrument Sans
  for everything else. It reads as written, not sold.
- **Structure.** Hairlines and white space instead of stacked cards. Numbered sections
  (`01 — How it works`). One reading column for prose, a wider one for tools.
- **Colour with meaning.** The troobiolabs.org colour family (the client asked for a similar
  scheme), used semantically and never as decoration: blue = interactive, green = human trials,
  orange = animal data / caution, purple = anecdotal, magenta = safety flags. The five-colour rule
  appears in exactly two places: under the wordmark and as the guide's progress line.
- **Water-like flow.** The guide's first question *is* the homepage hero. One question per
  screen, large tappable rows, keyboard numerals + Enter, auto-advance. The protocol shows one
  summary line per compound and opens only what needs editing.
- Light theme only, on purpose.

Tokens live in `src/app/globals.css`; primitives in `src/design/primitives.tsx`.

## Architecture: modular, no backend

```
content/            one JSON per compound + guides.json + glossary.json  (source of truth)
src/core/           pure domain logic, tested: schema, taxonomy, dose maths,
                    guide/{questions,filter}, plan/{plan,warnings,schedule,ics}
src/content/        server-only loader; validates every file at build time
src/state/          browser state: localStorage store, usePlan (URL ?p= plans)
src/design/         design system: tokens, primitives, Header, Footer, Prose, icons
src/features/       product areas: home, guide, plan, calendar, library, calculators
src/seo/            metadata helper, JSON-LD
src/app/            routes only. (site) = full chrome, (flow) = the guide, no chrome
scripts/            one-time migration from the design prototype (provenance only)
```

| Concern | How |
|---|---|
| Compound data | `content/compounds/<slug>.json`, validated by `src/content/loader.ts`. A `reportedRange` without a `source` fails the build. |
| User state | `localStorage`: guide answers, plan, ticked doses |
| Sharing | Plan encoded in `?p=`. A link that would replace a different saved plan asks first |
| Saving | Download JSON, print wall chart, export `.ics` |
| Auth / database | None |

The plan object carries a version field (`v`) and is validated on every read, so a persistence
layer can be added later without breaking saved links.

## Routes

| Route | |
|---|---|
| `/` | Hero = goal picker (starts the guide), how it works, grades, live specimen, FAQ |
| `/guide` | 8 questions, one per screen. `?goal=` pre-selects |
| `/guide/results` | Shortlist by evidence, "what we ruled out and why", empty state that offers to loosen Q7 |
| `/protocol` | One summary line per compound; expand to edit. Inline reconstitution, titration, non-blocking warnings |
| `/calendar` | Month/week, tick-off, site rotation + body map, vial countdown, `.ics` / print / JSON / link |
| `/peptides-for-*` | 10 indexable goal pages built from the data |
| `/compounds`, `/compounds/[slug]` | Library and profiles (published compounds only) |
| `/calculators` | 7 tools incl. GLP-1 titration, plus ~1,300 words of explainer and FAQ |
| `/guides`, `/glossary`, `/about`, `/editorial`, `/privacy`, `/terms` | Reference. Privacy and Terms are drafts pending legal review |

`/guide/results`, `/protocol` and `/calendar` are `noindex` and left out of the sitemap: they
only render the visitor's own browser data.

## Conventions

- **Numbers need sources.** Never render a dosing figure that isn't backed by `dosing.source`.
  `CitedDosing` handles both cases.
- **Disclaimers at the point of output.** `<Notice />` on any page that shows results, a plan or
  a schedule.
- **Base CSS stays in `@layer base`.** Unlayered rules outrank every Tailwind utility.
- **Page metadata goes through `pageMeta()`** (`src/seo/meta.tsx`). Next replaces a parent's
  `openGraph` instead of merging it, so the helper sets the social image on every page.
- Client components receive `CompoundSummary[]` from server pages. Long-form profile copy never
  reaches a client bundle.
