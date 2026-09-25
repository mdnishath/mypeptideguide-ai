/**
 * Schedule → .ics, via the `ics` library (RFC 5545) rather than a hand-rolled
 * format. One event per dose, because each dose differs — its injection site,
 * its titration step, its vial count — so a single RRULE couldn't carry them.
 *
 * Times are "floating" local times: a 21:30 dose stays at 21:30 wherever the
 * user's calendar is, which is what someone dosing before bed expects.
 */
import { createEvents, type EventAttributes } from "ics";
import { fmt, formatDose } from "../dose";
import { ROUTE_LABEL } from "../taxonomy";
import type { DoseEvent, Schedule } from "./schedule";

const PRODUCT = "mypeptideguide.ai";

function title(ev: DoseEvent) {
  const dose = ev.dose !== null ? ` — ${formatDose(ev.dose, ev.unit)}` : "";
  const units = ev.units !== null ? ` (${fmt(ev.units, 1)} units)` : "";
  return `${ev.name}${dose}${units}`;
}

function description(ev: DoseEvent) {
  const lines = [
    ev.dose !== null ? `Dose: ${formatDose(ev.dose, ev.unit)}` : "Dose: not set in your plan",
    ev.units !== null && ev.volumeMl !== null
      ? `Draw: ${fmt(ev.units, 1)} units on a U-100 syringe (${fmt(ev.volumeMl, 3)} mL)`
      : null,
    `Route: ${ROUTE_LABEL[ev.route]}`,
    ev.site ? `Site: ${ev.site.label}` : null,
    ev.stepUp ? "Titration step-up today." : null,
    ev.vial
      ? `${ev.vial.isNew ? `Reconstitute vial ${ev.vial.number} today. ` : ""}Vial ${ev.vial.number}: ${ev.vial.dosesLeft} doses left after this one; use by ${ev.vial.expiresOn}.`
      : null,
    "",
    "Your own plan, built at mypeptideguide.ai. Educational only, not medical advice. 18+.",
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export function scheduleToIcs(schedule: Schedule): { ok: true; ics: string } | { ok: false; error: string } {
  if (!schedule.events.length) return { ok: false, error: "There are no scheduled doses to export." };

  const events: EventAttributes[] = schedule.events.map((ev) => {
    const [y, m, d] = ev.date.split("-").map(Number);
    const [hh, mm] = ev.time.split(":").map(Number);
    const name = title(ev);
    return {
      uid: `${ev.slug}-${ev.date}-${ev.time.replace(":", "")}@${PRODUCT}`,
      title: name,
      description: description(ev),
      start: [y, m, d, hh, mm],
      startInputType: "local",
      startOutputType: "local",
      duration: { minutes: 10 },
      categories: ["Dosing"],
      alarms: [{ action: "display", description: name, trigger: { minutes: 15, before: true } }],
    };
  });

  const { error, value } = createEvents(events, { productId: PRODUCT, calName: "My peptide protocol" });
  if (error || !value) return { ok: false, error: error?.message ?? "Could not build the calendar file." };
  return { ok: true, ics: value };
}

/** Triggers a browser download of text content. */
export function downloadText(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
