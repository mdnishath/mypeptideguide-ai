import Calendar from "@/features/calendar/Calendar";
import { getPublishedCompounds } from "@/content/loader";
import { pageMeta } from "@/seo/meta";

export const metadata = pageMeta({
  title: "Dosing calendar",
  description: "Your protocol as a dated schedule: tick off doses, rotate injection sites, count down vials, then export to Google or Apple Calendar or print a wall chart.",
  path: "/calendar",
  noindex: true,
});

export default function CalendarPage() {
  return <Calendar compounds={getPublishedCompounds()} />;
}
