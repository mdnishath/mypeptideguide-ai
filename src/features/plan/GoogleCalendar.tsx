"use client";

import { CalendarPlus, ExternalLink } from "lucide-react";
import { googleCalendarUrl, type CalendarEvent } from "@/core/plan/google";

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/**
 * One "Add to Google Calendar" link per recurring series. Google's template
 * URL creates one event at a time, so a titrated or multi-cycle compound
 * lists one link per step. Each opens Google Calendar pre-filled; the
 * visitor presses Save there.
 */
export default function GoogleCalendarList({ events, compact = false }: { events: CalendarEvent[]; compact?: boolean }) {
  if (!events.length) return null;
  const single = events.length === 1;

  return (
    <div>
      {single ? (
        <a
          href={googleCalendarUrl(events[0])}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white"
        >
          <CalendarPlus size={18} aria-hidden="true" /> Add to Google Calendar
        </a>
      ) : (
        <ul className="m-0 flex list-none flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper p-0">
          {events.map((ev) => (
            <li key={ev.id} className={`flex items-center gap-3 ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold text-ink">{ev.name}</div>
                <div className="tnum text-[12px] text-body">
                  {ev.label} · {longDate(ev.firstDate)}
                  {ev.lastDate !== ev.firstDate ? ` – ${longDate(ev.lastDate)}` : ""}
                </div>
              </div>
              <a
                href={googleCalendarUrl(ev)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Add ${ev.name}, ${ev.label}, to Google Calendar`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 text-[13px] font-semibold text-paper hover:bg-blue"
              >
                <CalendarPlus size={14} aria-hidden="true" /> Add <ExternalLink size={12} className="opacity-60" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 mb-0 text-[12px] leading-[1.5] text-muted">
        {single
          ? "Opens Google Calendar with the series pre-filled: dose, units, route and first site. Press Save there."
          : `${events.length} series, because the dose or cycle changes. Each opens Google Calendar pre-filled; press Save there. Or import the .ics once for everything.`}
      </p>
    </div>
  );
}
