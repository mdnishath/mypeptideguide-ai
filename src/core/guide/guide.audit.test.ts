/**
 * Guide audit: every answer combination must obey the promises the brief makes.
 * Runs against the real content, so a bad edit to a compound file fails here.
 */
import { describe, expect, it } from "vitest";
import { getPublishedCompounds } from "@/content/loader";
import { GOAL_SLUGS } from "../schema";
import { GRADE_RANK, INJECTED_ROUTES } from "../taxonomy";
import { EMPTY_ANSWERS, type GuideAnswers } from "./questions";
import { runGuide } from "./filter";

const compounds = getPublishedCompounds();

const answers = (over: Partial<GuideAnswers>): GuideAnswers => ({
  ...EMPTY_ANSWERS,
  secondaryGoal: "none",
  experience: "done-a-cycle",
  routeComfort: "injection-ok",
  nothingCurrent: true,
  cycle: "12-weeks",
  adult: true,
  notAdvice: true,
  ...over,
});

const EXPERIENCE = ["first-time", "done-a-cycle", "ongoing"] as const;
const ROUTE = ["injection-ok", "no-injection"] as const;
const EVIDENCE = ["human-only", "include-preclinical"] as const;

describe("guide audit: every combination of answers", () => {
  for (const goal of GOAL_SLUGS) {
    for (const experience of EXPERIENCE) {
      for (const routeComfort of ROUTE) {
        for (const evidence of EVIDENCE) {
          it(`${goal} · ${experience} · ${routeComfort} · ${evidence}`, () => {
            const { shortlist, ruledOut } = runGuide(answers({ primaryGoal: goal, experience, routeComfort, evidence }), compounds);
            const pool = compounds.filter((c) => c.goals.includes(goal));

            // Every result is filed under the chosen goal.
            for (const c of shortlist) expect(c.goals, c.name).toContain(goal);
            // "Human trials only" never returns a weaker grade.
            if (evidence === "human-only") for (const c of shortlist) expect(c.evidenceGrade, c.name).toBe("human-rct");
            // "No injections" never returns an injection-only compound.
            if (routeComfort === "no-injection") for (const c of shortlist) expect(c.route.some((r) => !INJECTED_ROUTES.includes(r)), c.name).toBe(true);
            // First-timers never see experienced-only or anecdotal compounds.
            if (experience === "first-time") {
              for (const c of shortlist) {
                expect(c.experienceLevel, c.name).not.toBe("experienced");
                expect(c.evidenceGrade, c.name).not.toBe("anecdotal");
              }
            }
            // Strongest evidence first, always.
            for (let i = 1; i < shortlist.length; i++) expect(GRADE_RANK[shortlist[i].evidenceGrade]).toBeLessThanOrEqual(GRADE_RANK[shortlist[i - 1].evidenceGrade]);
            // Nothing silently dropped: shortlist + ruled out = the goal's pool, and every exclusion has a reason.
            expect(shortlist.length + ruledOut.length).toBe(pool.length);
            for (const r of ruledOut) expect(r.reasons.length, r.compound.name).toBeGreaterThan(0);
            // Unpublished compounds never leak.
            for (const c of [...shortlist, ...ruledOut.map((r) => r.compound)]) expect(c.profileComplete, c.name).toBe(true);
          });
        }
      }
    }
  }

  it("prints the goal map for human review", () => {
    const lines: string[] = [];
    for (const goal of GOAL_SLUGS) {
      const { shortlist } = runGuide(answers({ primaryGoal: goal, evidence: "include-preclinical" }), compounds);
      lines.push(`== ${goal} (${shortlist.length})`);
      for (const c of shortlist) {
        const flags = [c.evidenceGrade, c.route.join("/"), c.experienceLevel === "experienced" ? "EXPERIENCED" : "", c.dosing.source ? "cited" : "uncited"].filter(Boolean).join(" · ");
        lines.push(`   ${c.name.padEnd(18)} ${flags}`);
      }
    }
    console.log(lines.join("\n"));
    expect(lines.length).toBeGreaterThan(10);
  });
});
