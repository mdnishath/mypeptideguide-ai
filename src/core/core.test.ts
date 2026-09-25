import { describe, expect, it } from "vitest";
import { getAllCompoundRecords, getPublishedCompounds } from "@/content/loader";
import { EMPTY_ANSWERS, type GuideAnswers } from "./guide/questions";
import { loosenWouldAdd, runGuide } from "./guide/filter";
import { decodePlan, defaultItem, encodePlan, emptyPlan, parsePlan, type Plan, type PlanItem } from "./plan/plan";
import { planWarnings } from "./plan/warnings";
import { buildSchedule, SUBQ_SITES, daysBetween } from "./plan/schedule";
import { scheduleToIcs } from "./plan/ics";
import { calendarEventsFor, googleCalendarUrl, rruleFor } from "./plan/google";
import { GRADE_RANK } from "./taxonomy";

const compounds = getPublishedCompounds();
const bySlug = new Map(compounds.map((c) => [c.slug, c]));
const get = (slug: string) => bySlug.get(slug)!;

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

const plan = (items: PlanItem[], over: Partial<Plan> = {}): Plan => ({
  ...emptyPlan(),
  startDate: "2026-10-05",
  items,
  ...over,
});

describe("content", () => {
  it("loads and validates every compound, publishing only complete profiles", () => {
    expect(getAllCompoundRecords()).toHaveLength(54);
    expect(compounds).toHaveLength(40);
  });

  it("never pairs a dosing range with a missing source", () => {
    for (const c of getAllCompoundRecords()) {
      if (c.dosing.reportedRange) expect(c.dosing.source, c.slug).toBeTruthy();
    }
  });
});

describe("guide filter", () => {
  it("shortlists only human-trial compounds by default and explains the rest", () => {
    const { shortlist, ruledOut } = runGuide(answers({ primaryGoal: "recovery" }), compounds);
    expect(shortlist.length).toBeGreaterThan(0);
    expect(shortlist.every((c) => c.evidenceGrade === "human-rct")).toBe(true);
    const bpc = ruledOut.find((r) => r.compound.slug === "bpc-157");
    expect(bpc?.reasons).toContain("Animal data only, and you asked for human trials");
  });

  it("sorts by evidence grade first when preclinical is allowed", () => {
    const { shortlist } = runGuide(answers({ primaryGoal: "recovery", evidence: "include-preclinical" }), compounds);
    const ranks = shortlist.map((c) => GRADE_RANK[c.evidenceGrade]);
    expect(ranks).toEqual([...ranks].sort((a, b) => b - a));
    expect(shortlist.some((c) => c.slug === "bpc-157")).toBe(true);
  });

  it("keeps experienced-only and anecdotal compounds away from first-timers", () => {
    const { shortlist, ruledOut } = runGuide(
      answers({ primaryGoal: "weight-loss", experience: "first-time", evidence: "include-preclinical" }),
      compounds,
    );
    expect(shortlist.some((c) => c.slug === "retatrutide")).toBe(false);
    expect(ruledOut.find((r) => r.compound.slug === "retatrutide")?.reasons[0]).toMatch(/experienced users/);
    expect(shortlist.some((c) => c.evidenceGrade === "anecdotal")).toBe(false);
  });

  it("filters to non-injected routes when asked", () => {
    const { shortlist, ruledOut } = runGuide(
      answers({ primaryGoal: "sleep", routeComfort: "no-injection", evidence: "include-preclinical" }),
      compounds,
    );
    expect(shortlist.map((c) => c.slug)).toContain("mk-677");
    expect(shortlist.some((c) => c.slug === "ipamorelin")).toBe(false);
    expect(ruledOut.find((r) => r.compound.slug === "ipamorelin")?.reasons.join()).toMatch(/no injections/);
  });

  it("reports how many results each loosening would add", () => {
    const a = answers({ primaryGoal: "longevity", routeComfort: "no-injection" });
    expect(runGuide(a, compounds).shortlist).toHaveLength(0);
    const { preclinical, injections } = loosenWouldAdd(a, compounds);
    expect(preclinical).toBe(0); // still nothing without injections
    expect(injections).toBeGreaterThan(0);
    expect(loosenWouldAdd({ ...a, evidence: "include-preclinical", routeComfort: "injection-ok" }, compounds)).toEqual({ preclinical: 0, injections: 0 });
  });

  it("does not file weight-loss drugs under energy or a stroke drug under tissue recovery", () => {
    const energy = runGuide(answers({ primaryGoal: "energy" }), compounds).shortlist.map((c) => c.slug);
    expect(energy).not.toContain("glp-1-s");
    expect(energy).not.toContain("retatrutide");
    const recovery = runGuide(answers({ primaryGoal: "recovery" }), compounds).shortlist.map((c) => c.slug);
    expect(recovery).not.toContain("cerebrolysin");
  });
});

describe("plan defaults", () => {
  it("pre-fills a cited titration and leaves uncited doses empty", () => {
    const glp = defaultItem(get("glp-1-s"), { cycle: "12-weeks" });
    expect(glp).toMatchObject({ dose: 0.25, unit: "mg", frequency: "weekly", cycleWeeks: 12 });
    expect(glp.titration?.map((s) => s.dose)).toEqual([0.25, 0.5, 1, 1.7, 2.4]);

    const ipa = defaultItem(get("ipamorelin"), { cycle: "short" });
    expect(ipa).toMatchObject({ dose: null, time: "21:30", cycleWeeks: 4, route: "subq" });
  });

  it("round-trips through the URL codec and rejects tampering", () => {
    const p = plan([defaultItem(get("glp-1-s")), defaultItem(get("ipamorelin"))], { currentlyTaking: ["bpc-157"] });
    const known = new Set(bySlug.keys());
    expect(decodePlan(encodePlan(p), known)).toEqual(p);
    expect(decodePlan("not-base64!!", known)).toBeNull();
    const withUnknown = parsePlan({ ...p, items: [...p.items, { ...p.items[0], slug: "made-up" }] }, known);
    expect(withUnknown?.items).toHaveLength(2);
    expect(parsePlan({ ...p, v: 99 })).toBeNull();
  });
});

describe("schedule", () => {
  it("schedules weekly doses with titration step-ups", () => {
    const item = { ...defaultItem(get("glp-1-s")), cycleWeeks: 12 };
    const s = buildSchedule(plan([item]), bySlug);
    expect(s.events).toHaveLength(12);
    expect(s.events.map((e) => e.dose)).toEqual([0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1]);
    expect(s.events.filter((e) => e.stepUp).map((e) => e.date)).toEqual(["2026-11-02", "2026-11-30"]);
  });

  it("honours each frequency", () => {
    const base = { ...defaultItem(get("ipamorelin")), dose: 250, cycleWeeks: 2 };
    const count = (frequency: PlanItem["frequency"]) =>
      buildSchedule(plan([{ ...base, frequency }]), bySlug).events.length;
    expect(count("daily")).toBe(14);
    expect(count("eod")).toBe(7);
    expect(count("2x-week")).toBe(4);
    expect(count("weekly")).toBe(2);
    expect(count("5-on-2-off")).toBe(10);
    expect(count("as-needed")).toBe(0);
  });

  it("schedules repeats with off-week blocks", () => {
    const item = { ...defaultItem(get("ipamorelin")), dose: 250, cycleWeeks: 2, offWeeks: 1, repeats: 2 };
    const s = buildSchedule(plan([item]), bySlug);
    expect(s.events).toHaveLength(28);
    expect(s.offBlocks).toEqual([
      { slug: "ipamorelin", name: "Ipamorelin", from: "2026-10-19", to: "2026-10-25" },
      { slug: "ipamorelin", name: "Ipamorelin", from: "2026-11-09", to: "2026-11-15" },
    ]);
    expect(s.events[14].date).toBe("2026-10-26");
    expect(s.end).toBe("2026-11-15");
  });

  it("works out units to draw and counts a vial down, replacing it when empty or expired", () => {
    // 5 mg vial + 2.5 mL water = 2 mg/mL. 250 mcg = 0.125 mL = 12.5 units. 20 doses per vial.
    const item = { ...defaultItem(get("ipamorelin")), dose: 250, cycleWeeks: 6, vialMg: 5, waterMl: 2.5 };
    const s = buildSchedule(plan([item]), bySlug);
    expect(s.events[0]).toMatchObject({ units: 12.5, volumeMl: 0.125 });
    expect(s.events[0].vial).toMatchObject({ number: 1, isNew: true, dosesLeft: 19 });
    expect(s.events[19].vial).toMatchObject({ number: 1, dosesLeft: 0 });
    expect(s.events[20].vial).toMatchObject({ number: 2, isNew: true });

    // Slow use: 1 dose a week from a 20-dose vial expires at 28 days, not when empty.
    const weekly = buildSchedule(plan([{ ...item, frequency: "weekly" }]), bySlug);
    const firstNew = weekly.events.findIndex((e, i) => i > 0 && e.vial?.isNew);
    expect(daysBetween(weekly.events[0].date, weekly.events[firstNew].date)).toBe(28);
  });

  it("rotates injection sites, longest-rested first, across compounds", () => {
    const a = { ...defaultItem(get("ipamorelin")), dose: 250, cycleWeeks: 1 };
    const b = { ...defaultItem(get("bpc-157")), dose: 250, cycleWeeks: 1, time: "08:00" };
    const s = buildSchedule(plan([a, b]), bySlug);
    const sites = s.events.map((e) => e.site?.id);
    expect(sites.slice(0, SUBQ_SITES.length)).toEqual(SUBQ_SITES.map((x) => x.id));
    expect(sites[SUBQ_SITES.length]).toBe(SUBQ_SITES[0].id);
    expect(s.events[0].time).toBe("08:00"); // same day: morning before bed
  });
});

describe("warnings", () => {
  it("flags same class, overlapping axes, doubling up and over-long cycles — without blocking", () => {
    const p = plan(
      [
        defaultItem(get("ipamorelin")),
        defaultItem(get("ghrp-2")),
        defaultItem(get("cjc-1295")),
        { ...defaultItem(get("glp-1-s")), cycleWeeks: 80 },
      ],
      { currentlyTaking: ["cjc-1295"] },
    );
    const kinds = planWarnings(p, bySlug).map((w) => w.kind);
    expect(kinds).toContain("same-class");
    expect(kinds).toContain("interaction");
    expect(kinds).toContain("already-taking");
    expect(kinds).toContain("cycle-length");
  });

  it("stays quiet for an unremarkable plan", () => {
    expect(planWarnings(plan([defaultItem(get("glp-1-s"))]), bySlug)).toEqual([]);
  });
});

describe("ics export", () => {
  it("writes one floating-time event per dose, each with a reminder", () => {
    const item = { ...defaultItem(get("ipamorelin")), dose: 250, cycleWeeks: 1, vialMg: 5, waterMl: 2.5 };
    const out = scheduleToIcs(buildSchedule(plan([item]), bySlug));
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.ics.match(/BEGIN:VEVENT/g)).toHaveLength(7);
    expect(out.ics.match(/BEGIN:VALARM/g)).toHaveLength(7);
    expect(out.ics).toContain("DTSTART:20261005T213000");
    expect(out.ics).not.toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(out.ics).toContain("12.5 units");
  });

  it("refuses an empty schedule", () => {
    expect(scheduleToIcs(buildSchedule(plan([]), bySlug)).ok).toBe(false);
  });
});

describe("google calendar links", () => {
  it("makes one recurring event per run of identical doses", () => {
    const glp = { ...defaultItem(get("glp-1-s")), cycleWeeks: 12 };
    const s = buildSchedule(plan([glp]), bySlug);
    const events = calendarEventsFor(s, () => "weekly");
    expect(events.map((e) => [e.count, e.rrule])).toEqual([
      [4, "RRULE:FREQ=WEEKLY;COUNT=4"],
      [4, "RRULE:FREQ=WEEKLY;COUNT=4"],
      [4, "RRULE:FREQ=WEEKLY;COUNT=4"],
    ]);
    expect(events[0].title).toBe("GLP-1 (S) — 0.25 mg");
    expect(events[1].date).toBe("2026-11-02");
    const url = new URL(googleCalendarUrl(events[0]));
    expect(url.searchParams.get("dates")).toBe("20261005T090000/20261005T091000");
    expect(url.searchParams.get("recur")).toBe("RRULE:FREQ=WEEKLY;COUNT=4");
  });

  it("splits runs at cycle boundaries and expresses every frequency", () => {
    const item = { ...defaultItem(get("ipamorelin")), dose: 250, cycleWeeks: 2, offWeeks: 1, repeats: 2, frequency: "5-on-2-off" as const };
    const s = buildSchedule(plan([item]), bySlug);
    const events = calendarEventsFor(s, () => "5-on-2-off");
    expect(events).toHaveLength(2);
    expect(events[0].rrule).toBe("RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;COUNT=10");
    expect(events[1].label).toBe("Cycle 2 · 10 doses");
    expect(rruleFor("2x-week", "2026-10-07", 4)).toBe("RRULE:FREQ=WEEKLY;BYDAY=WE,SA;COUNT=4");
    expect(rruleFor("eod", "2026-10-05", 7)).toBe("RRULE:FREQ=DAILY;INTERVAL=2;COUNT=7");
    expect(rruleFor("daily", "2026-10-05", 1)).toBeNull();
  });
});
