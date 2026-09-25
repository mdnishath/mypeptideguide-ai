# Content status: what's real, what's drafted, what's missing

The v1 build is complete as software. The **content** is the remaining work, and the
brief's rules make that visible on purpose. The site never shows a dosing number it
can't cite, and never claims a review that didn't happen. This file lists exactly where
things stand, so editorial work can start from it.

Source of truth: one file per compound in `content/compounds/*.json`. The build validates
every file (`src/content/loader.ts`) and fails on a broken rule. For example, a
`reportedRange` without a `source` stops the build.

## At a glance

| | Count |
|---|---|
| Compounds in the dataset | 54 |
| Published (`profileComplete: true`) | 40 |
| Published with a **cited dosing range** | 10 |
| Published with **no** dosing range shown | 30 |
| Full long-form profiles (how / research / FAQ / refs) | 6 |
| Editorially reviewed (`reviewedOn` set) | **0** |

## 1. Added by the developer. Needs editorial verification

These came from outside the prototype. Each one is a factual claim that shows on the site.

### Dosing sources (10 compounds)
Ranges and sources come from prescribing labels or named trials. Check each citation
against the source before launch:

| Compound | Range | Basis |
|---|---|---|
| GLP-1 (S) | 0.25–2.4 mg weekly, 5-step titration | Wegovy USPI; STEP 1 (NEJM 2021) |
| GLP-1/GIP (T) | 2.5–15 mg weekly, 6-step titration | Zepbound USPI; SURMOUNT-1 (NEJM 2022) |
| Retatrutide | 1–12 mg weekly | Phase 2, NEJM 2023 |
| Cagrilintide | 0.3–4.5 mg weekly | Phase 2 dose-finding, Lancet 2021 |
| Survodutide | 0.6–4.8 mg weekly | Phase 2, Lancet Diabetes Endocrinol 2024 |
| Tesofensine | 0.25–1 mg daily | Phase 2, Lancet 2008 (prototype said 0.25–0.5; widened to match the trial) |
| MK-677 | 10–25 mg daily | Chapman 1996 (JCEM); Nass 2008 (Ann Intern Med) |
| Tesamorelin | 1.4–2 mg daily | Egrifta / Egrifta SV USPI; Falutz 2007 (NEJM) |
| PT-141 | 1.75 mg as needed | Vyleesi USPI 2019 |
| Thymosin Alpha-1 | 1.6 mg twice weekly | Zadaxin product information |

`typicalCycleWeeks` for these is the trial or label duration. It drives the
"runs longer than published protocols" warning.

### Caveat lines (40 compounds)
The "The catch" / "What the evidence doesn't show" line on every card and profile.
Each one is based on the prototype's own descriptions. Where a compound had nothing to
draw from, it falls back to a generic line per grade. Please review all 40.

### Classifications
- `mechanismClass`: drives the same-class warning (e.g. GHRP + GHRP).
- `interactsWith`: generated from three axes in `src/core/taxonomy.ts` (GH/IGF-1,
  appetite/incretin, reproductive/HPG).
- `experienceLevel: "experienced"`: hides these from first-timers. Currently Retatrutide,
  Tesofensine, GHRP-6, IGF-1 LR3, Melanotan II, Cerebrolysin, Dihexa, Kisspeptin-10
  (plus unpublished Hexarelin, Follistatin 344, FOXO4-DRI).
- `route` for six published compounds had no prototype data and was assigned:
  Thymosin Beta-4, KPV, LL-37, MOTS-c, SS-31, Dihexa. Route drives the
  "no injections" filter, so these matter.

## 2. Missing, and the site is honest about it

- **Dosing for 30 published compounds.** They show "No cited dosing range on file yet",
  and the protocol builder leaves the dose empty. The prototype's uncited figures are kept
  in `dosing.conventionNote` for the editor. They are never rendered.
- **Hidden dosage prose.** BPC-157, DSIP, Epithalon, Ipamorelin and Sermorelin have a
  written "Dosage" paragraph in `profile.dosage`. It contains uncited numbers, so it stays
  hidden until `dosing.source` is filled in.
- **`reviewedOn` is null everywhere.** Profiles say "Editorial review pending". The
  prototype's "Last reviewed Aug 2026" was not carried over because no review has
  happened. Set the date per compound once each one is reviewed.
- **`citationCount`** is currently the number of references listed on the profile
  (1–3), not a count of the literature. It's shown as "N cited".
- **Full profiles** (how it works / research / FAQ / references) exist for 6 compounds.
  The other 34 have a summary, research bullets by grade, and safety bullets.
- **Guides**: 3 written, 5 listed as "Coming next".

## 2b. Guide audit (2026-09-26)

`src/core/guide/guide.audit.test.ts` runs every answer combination (10 goals × 3 experience
× 2 route × 2 evidence) and asserts the brief's promises: results are filed under the goal,
"human trials only" never returns a weaker grade, "no injections" never returns an
injection-only compound, first-timers never see experienced-only or anecdotal compounds,
sorting is by evidence, and every exclusion carries a reason. It runs against the real
content, so a bad edit fails the build.

**Two goal filings changed** because they produced misleading top results:

| Compound | Was | Now | Why |
|---|---|---|---|
| GLP-1 (S), GLP-1/GIP (T), Retatrutide | weight-loss, energy | weight-loss | Someone asking about *energy* got semaglutide as the top result |
| Cerebrolysin | cognitive, recovery | cognitive | A stroke drug given IM/IV was the #1 *tissue-repair* result |

**Judgment calls left as filed, for Andrew to confirm:**
- GHRP-2, Ipamorelin, Sermorelin under *sleep* (GH secretagogues deepen slow-wave sleep; the
  sleep evidence is secondary).
- Oxytocin under *cognitive* (intranasal social/mood findings, poorly replicated).
- SS-31 under *energy* and *longevity* (trials in mitochondrial disease and heart failure,
  not healthy adults). With the GLP-1s removed it is the only human-trial energy option.
- LL-37 under *immune* and *recovery*; GHK-Cu under *recovery* (its human data is topical).
- *Longevity* has no non-injected option. The empty state now says so and offers to allow
  injections rather than returning nothing.

## 3. Owned by Andrew (per the brief)

- Final question wording: `src/core/guide/questions.ts`.
- Answer → compound mapping: `src/core/guide/filter.ts`. Every exclusion carries the
  plain-English reason shown in "What we ruled out, and why".

Both files are working drafts with the brief's logic built in. Swap in the final
version and the tests in `src/core/core.test.ts` show what changed.

## 4. Before launch

- [ ] Privacy and Terms reviewed by counsel (both are marked DRAFT in source).
- [ ] Add the corrections email to `/editorial#corrections` (TODO in source).
- [ ] Decide the affiliate policy (brief: decide before traffic arrives). The editorial
      page currently states that grades are not for sale and any commercial relationship
      will be disclosed.
- [ ] Brief recommendation: publish the ~50 compounds with real search volume.
      Currently 40 are published. The 14 unpublished ones are in `content/compounds` with
      `profileComplete: false`.
