// Viewport-sized peeks at key mobile screens, with a plan pre-seeded in localStorage.
//   node e2e/peek.mjs [baseURL]
import { chromium, devices } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3200";
const plan = {
  v: 1,
  startDate: "2026-10-05",
  currentlyTaking: [],
  items: [
    { slug: "cagrilintide", dose: 0.3, unit: "mg", frequency: "weekly", time: "09:00", route: "subq", cycleWeeks: 12, offWeeks: 0, repeats: 1, titration: null, vialMg: 5, waterMl: 2 },
    { slug: "glp-1-s", dose: 0.25, unit: "mg", frequency: "weekly", time: "09:00", route: "subq", cycleWeeks: 12, offWeeks: 0, repeats: 1, titration: [{ week: 0, dose: 0.25 }, { week: 4, dose: 0.5 }, { week: 8, dose: 1 }], vialMg: null, waterMl: null },
  ],
};
const guide = {
  step: 7,
  answers: { primaryGoal: "weight-loss", secondaryGoal: "none", experience: "done-a-cycle", routeComfort: "injection-ok", currentlyTaking: [], nothingCurrent: true, cycle: "12-weeks", evidence: "human-only", adult: true, notAdvice: true },
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 7"] });
await ctx.addInitScript(([p, g]) => {
  localStorage.setItem("mpg:plan:v1", JSON.stringify(p));
  localStorage.setItem("mpg:guide:v1", JSON.stringify(g));
}, [plan, guide]);
const page = await ctx.newPage();

const peek = async (path, name, scrollTo) => {
  await page.goto(base + path, { waitUntil: "networkidle" });
  if (scrollTo) await page.locator(scrollTo).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `e2e/shots/peek-${name}.png` });
  console.log("shot", name);
};

await peek("/", "home-top");
await peek("/protocol", "protocol-top");
await peek("/protocol", "protocol-compound", "article");
await peek("/protocol", "protocol-prepare", "text=Prepare");
await peek("/guide/results", "results-top");
await peek("/calendar", "calendar-top");
await browser.close();
