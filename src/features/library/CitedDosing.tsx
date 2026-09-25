import type { CompoundSummary } from "@/core/schema";
import { FREQUENCY_LABEL } from "@/core/taxonomy";
import { formatRange } from "@/core/dose";

/** "Reported range … Source: …", or the honest statement that we have none. */
export default function CitedDosing({ c, className = "" }: { c: CompoundSummary; className?: string }) {
  const d = c.dosing;
  if (!d.source || !d.reportedRange) {
    return (
      <p className={`m-0 text-[13px] leading-[1.55] text-body ${className}`}>
        <span className="font-medium text-ink">No cited dosing range on file yet.</span> We only show a number when we can cite
        where it comes from.
      </p>
    );
  }
  return (
    <p className={`m-0 text-[13px] leading-[1.55] text-body ${className}`}>
      <span className="font-medium text-ink">
        Reported range {formatRange(d.reportedRange)}, {FREQUENCY_LABEL[d.frequency].toLowerCase()}
        {d.titration ? ", titrated in steps" : ""}.
      </span>{" "}
      Source: {d.source}
    </p>
  );
}
