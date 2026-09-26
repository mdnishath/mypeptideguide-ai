"use client";

import { useState } from "react";
import { Apple, CalendarPlus, Download, Printer } from "lucide-react";
import type { CalendarEvent } from "@/core/plan/google";
import { downloadText, scheduleToIcs } from "@/core/plan/ics";
import type { Schedule } from "@/core/plan/schedule";
import GoogleCalendarList from "./GoogleCalendar";

/**
 * "Add to your calendar", the same on the protocol and calendar pages.
 * Google: template links (one per series). Apple: the .ics, which Apple
 * Calendar opens and offers to add on iPhone and Mac. Outlook and everything
 * else import the same file.
 */
export default function CalendarExport({ schedule, gcal, compact = false, print = false }: { schedule: Schedule; gcal: CalendarEvent[]; compact?: boolean; print?: boolean }) {
  const [error, setError] = useState<string | null>(null);

  const ics = () => {
    const out = scheduleToIcs(schedule);
    if (!out.ok) return setError(out.error);
    setError(null);
    downloadText("mypeptideguide-protocol.ics", out.ics, "text/calendar;charset=utf-8");
  };

  const wrap = compact ? "flex flex-col gap-5" : "grid gap-8 lg:grid-cols-3";

  return (
    <div className={wrap}>
      <div>
        <div className="eyebrow flex items-center gap-2">
          <CalendarPlus size={14} aria-hidden="true" /> Google Calendar
        </div>
        <div className="mt-3">
          <GoogleCalendarList events={gcal} compact={compact} />
        </div>
      </div>

      <div>
        <div className="eyebrow flex items-center gap-2">
          <Apple size={14} aria-hidden="true" /> Apple Calendar
        </div>
        <button type="button" onClick={ics} className="mt-3 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-paper transition-colors hover:bg-blue-deep">
          <Apple size={18} aria-hidden="true" /> Add to Apple Calendar
        </button>
        <p className="mt-2 mb-0 text-[12px] leading-[1.5] text-muted">
          Opens in Calendar on iPhone and Mac. Tap <b className="font-semibold text-ink">Add</b>. Every dose, with a reminder 15 minutes before, the units to draw and
          that day&rsquo;s injection site.
        </p>
      </div>

      <div>
        <div className="eyebrow flex items-center gap-2">
          <Download size={14} aria-hidden="true" /> Outlook and others
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={ics} className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-2 bg-paper px-5 text-[14px] font-semibold text-ink hover:border-ink">
            <Download size={16} aria-hidden="true" /> Download .ics
          </button>
          {print && (
            <button type="button" onClick={() => window.print()} className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-2 bg-paper px-5 text-[14px] font-semibold text-ink hover:border-ink">
              <Printer size={16} aria-hidden="true" /> Print wall chart
            </button>
          )}
        </div>
        <p className="mt-2 mb-0 text-[12px] leading-[1.5] text-muted">Outlook, Samsung, Proton and any calendar that imports .ics. Google Calendar can import it too.</p>
        {error && <p className="mt-2 mb-0 text-[12.5px] font-medium text-magenta-deep">{error}</p>}
      </div>
    </div>
  );
}
