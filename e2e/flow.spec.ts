import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const SHOTS = "e2e/shots";
mkdirSync(SHOTS, { recursive: true });

/** Nothing outside an intentional horizontal scroller may extend past the viewport. */
async function expectNoOverflow(page: Page, label: string) {
  const offenders = await page.evaluate(() => {
    const vw = window.innerWidth;
    const bad: string[] = [];
    const clipped = (el: HTMLElement) => {
      for (let a = el.parentElement; a; a = a.parentElement) {
        const o = getComputedStyle(a).overflowX;
        if ((o === "hidden" || o === "clip") && a.getBoundingClientRect().right <= vw + 1) return true;
      }
      return false;
    };
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      if (el.closest(".overflow-x-auto") || clipped(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 1) bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")} right=${Math.round(r.right)}`);
      if (bad.length > 5) break;
    }
    return { bad, scrollWidth: document.documentElement.scrollWidth, vw };
  });
  expect(offenders.bad, `${label}: elements past the viewport`).toEqual([]);
  expect(offenders.scrollWidth, `${label}: page wider than viewport`).toBeLessThanOrEqual(offenders.vw + 1);
}

async function shot(page: Page, name: string, project: string) {
  await page.screenshot({ path: `${SHOTS}/${project}-${name}.png`, fullPage: true });
}

test.describe("full flow", () => {
  test("home → guide → results → protocol → calendar", async ({ page }, info) => {
    const p = info.project.name;

    // Home
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Which peptides");
    await expectNoOverflow(page, "home");
    await shot(page, "01-home", p);

    // Goal tile starts the guide at question 2
    await page.getByRole("group", { name: /mainly looking into/i }).getByRole("button", { name: /Weight loss/ }).click();
    await expect(page).toHaveURL(/\/guide$/);
    await expect(page.getByText("2 / 8")).toBeVisible();
    await expectNoOverflow(page, "guide q2");
    await shot(page, "02-guide-q2", p);

    // Q2 skip
    await page.getByRole("radio", { name: /No second goal/ }).click();
    await expect(page.getByText("3 / 8")).toBeVisible();
    // Q3 experience
    await page.getByRole("radio", { name: /done a cycle/ }).click();
    await expect(page.getByText("4 / 8")).toBeVisible();
    // Q4 route
    await page.getByRole("radio", { name: /injections are fine/ }).click();
    await expect(page.getByText("5 / 8")).toBeVisible();
    // Q5 nothing, then Next
    await page.getByRole("radio", { name: /Nothing right now/ }).click();
    await page.getByRole("button", { name: /^Next/ }).click();
    await expect(page.getByText("6 / 8")).toBeVisible();
    // Q6 cycle
    await page.getByRole("radio", { name: /Around 12 weeks/ }).click();
    await expect(page.getByText("7 / 8")).toBeVisible();
    await shot(page, "03-guide-q7", p);
    // Q7 default, Next
    await expect(page.getByRole("radio", { name: /Human trials only/ })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: /^Next/ }).click();
    await expect(page.getByText("8 / 8")).toBeVisible();
    // Q8 confirm
    await page.getByText("I am 18 or older.").click();
    await page.getByText(/I understand this is educational/).click();
    await expectNoOverflow(page, "guide q8");
    await page.getByRole("button", { name: /See my shortlist/ }).click();

    // Results
    await expect(page).toHaveURL(/\/guide\/results$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/compounds? fit/);
    const adds = page.getByRole("button", { name: /Add to protocol/ });
    await expect(adds.first()).toBeVisible();
    await expectNoOverflow(page, "results");
    await shot(page, "04-results", p);
    await adds.nth(0).click();
    await adds.nth(0).click(); // second row (first is now "Added")
    await page.getByRole("button", { name: /Build my protocol/ }).click();

    // Protocol
    await expect(page).toHaveURL(/\/protocol$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("step by step");
    await expect(page.getByText("Your plan at a glance")).toBeVisible();
    await expectNoOverflow(page, "protocol");
    // First compound is open: fill vial + water in its Prepare step.
    await page.getByLabel("Vial · mg").first().fill("5");
    await page.getByLabel("BAC water · mL").first().fill("2");
    await expect(page.getByText(/Draw to/).first()).toBeVisible();
    await expectNoOverflow(page, "protocol filled");
    await shot(page, "05-protocol", p);
    await expect(page.getByRole("link", { name: /Add to my calendar|to Google Calendar/ }).first()).toBeVisible();

    // Calendar
    await page.getByRole("link", { name: /Open the full calendar/ }).click();
    await expect(page).toHaveURL(/\/calendar$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/doses/);
    await expect(page.getByText("Next dose")).toBeVisible();
    await expectNoOverflow(page, "calendar");
    await shot(page, "06-calendar", p);
  });

  for (const path of ["/compounds", "/compounds/ipamorelin", "/peptides-for-sleep", "/calculators", "/guides", "/guides/recon", "/glossary", "/about"]) {
    test(`page ${path} fits the viewport`, async ({ page }, info) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoOverflow(page, path);
      await shot(page, `page${path.replace(/\//g, "-")}`, info.project.name);
    });
  }
});
