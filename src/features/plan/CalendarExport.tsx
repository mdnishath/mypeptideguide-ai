"use client";

import { useState, useSyncExternalStore } from "react";
import { CalendarPlus, Download, Printer } from "lucide-react";
import { googleCalendarUrl, type CalendarEvent } from "@/core/plan/google";
import { downloadText, scheduleToIcs } from "@/core/plan/ics";
import type { Schedule } from "@/core/plan/schedule";
import GoogleCalendarList from "./GoogleCalendar";

type Provider = "apple" | "google";

const noop = () => () => {};
const detectApple = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

/**
 * One button. The device picks the calendar: Apple devices get the .ics,
 * which Calendar opens and offers to add; everything else opens Google
 * Calendar pre-filled. A small link switches. Outlook and the rest import the
 * same .ics.
 */
export default function CalendarExport({ schedule, gcal, print = false }: { schedule: Schedule; gcal: CalendarEvent[]; print?: boolean }) {
  const isApple = useSyncExternalStore(noop, detectApple, () => false);
  const [choice, setChoice] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const provider: Provider = choice ?? (isApple ? "apple" : "google");

  const ics = () => {
    const out = scheduleToIcs(schedule);
    if (!out.ok) return setError(out.error);
    setError(null);
    downloadText("mypeptideguide-protocol.ics", out.ics, "text/calendar;charset=utf-8");
  };

  const btn = "btn-primary inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white";

  return (
    <div>
      {provider === "apple" ? (
        <>
          <button type="button" onClick={ics} className={btn}>
            <CalendarPlus size={18} aria-hidden="true" /> Add to my calendar
          </button>
          <p className="mt-2 mb-0 text-[12px] leading-[1.5] text-muted">
            Opens in Apple Calendar. Tap <b className="font-semibold text-ink">Add</b>. Every dose with a reminder 15 minutes before, the units to draw and that
            day&rsquo;s injection site.
          </p>
        </>
      ) : gcal.length === 1 ? (
        <>
          <a href={googleCalendarUrl(gcal[0])} target="_blank" rel="noopener noreferrer" className={btn}>
            <CalendarPlus size={18} aria-hidden="true" /> Add to my calendar
          </a>
          <p className="mt-2 mb-0 text-[12px] leading-[1.5] text-muted">Opens Google Calendar with the series pre-filled: dose, units, route and first site. Press Save.</p>
        </>
      ) : (
        <GoogleCalendarList events={gcal} compact />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
        <span>
          {provider === "apple" ? "Apple Calendar" : "Google Calendar"} ·{" "}
          <button type="button" onClick={() => setChoice(provider === "apple" ? "google" : "apple")} className="cursor-pointer font-semibold text-blue-deep hover:text-ink">
            use {provider === "apple" ? "Google" : "Apple"} instead
          </button>
        </span>
        <button type="button" onClick={ics} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-blue-deep hover:text-ink">
          <Download size={13} aria-hidden="true" /> Outlook / other (.ics)
        </button>
        {print && (
          <button type="button" onClick={() => window.print()} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-blue-deep hover:text-ink">
            <Printer size={13} aria-hidden="true" /> Print wall chart
          </button>
        )}
      </div>
      {error && <p className="mt-2 mb-0 text-[12.5px] font-medium text-magenta-deep">{error}</p>}
    </div>
  );
}
