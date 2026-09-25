"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Link2 } from "lucide-react";
import { encodePlan, parsePlan, todayISO, type Plan } from "@/core/plan/plan";
import { downloadText } from "@/core/plan/ics";
import { Button } from "@/design/primitives";

const quiet = "inline-flex h-10 cursor-pointer items-center gap-2 text-[14px] font-medium text-body hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

/** Download JSON · copy shareable link · import JSON, on both protocol and calendar. */
export default function PlanActions({
  plan,
  knownSlugs,
  onImport,
  path,
}: {
  plan: Plan;
  knownSlugs: Set<string>;
  onImport: (p: Plan) => void;
  path: "/protocol" | "/calendar";
}) {
  const [note, setNote] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const empty = !plan.items.length;

  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(null), 2800);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}${path}?p=${encodePlan(plan)}`;
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied. Anyone with it can see this plan.");
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const importFile = async (f: File) => {
    try {
      const parsed = parsePlan(JSON.parse(await f.text()), knownSlugs);
      if (!parsed) throw new Error();
      onImport(parsed);
      flash(`Imported ${parsed.items.length} compound${parsed.items.length === 1 ? "" : "s"}.`);
    } catch {
      flash("That file isn't a mypeptideguide plan we can read.");
    }
  };

  return (
    <div data-print="hide">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
        <button
          type="button"
          className={quiet}
          disabled={empty}
          onClick={() => downloadText(`mypeptideguide-plan-${todayISO()}.json`, JSON.stringify(plan, null, 2), "application/json")}
        >
          <Download size={16} aria-hidden="true" /> Download JSON
        </button>
        <button type="button" className={quiet} disabled={empty} onClick={copyLink}>
          <Link2 size={16} aria-hidden="true" /> Copy shareable link
        </button>
        <button type="button" className={quiet} onClick={() => file.current?.click()}>
          <FileUp size={16} aria-hidden="true" /> Import JSON
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importFile(f);
            e.target.value = "";
          }}
        />
      </div>
      <p role="status" aria-live="polite" className="mt-2 mb-0 min-h-[18px] text-[13px] text-muted">
        {note}
      </p>
    </div>
  );
}

/** Shown when a shared link would replace a different saved plan. */
export function IncomingBanner({ count, onAccept, onDismiss }: { count: number; onAccept: () => void; onDismiss: () => void }) {
  return (
    <div role="alert" className="mt-6 flex flex-wrap items-center gap-4 border-l-2 border-blue bg-blue-wash px-5 py-4">
      <span className="flex-1 text-[14px] leading-[1.5] text-ink">
        <b className="font-semibold">This link contains a different plan</b> ({count} compound{count === 1 ? "" : "s"}). Load it in place of the
        one saved in this browser?
      </span>
      <Button variant="secondary" size="sm" onClick={onDismiss}>
        Keep mine
      </Button>
      <Button size="sm" onClick={onAccept}>
        Load linked plan
      </Button>
    </div>
  );
}
