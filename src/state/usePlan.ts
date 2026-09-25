"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { KEYS, useStored, writeStored } from "./store";
import { decodePlan, parsePlan, samePlan, type Plan } from "@/core/plan/plan";

const URL_EVENT = "mpg:url";

function subscribeUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(URL_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(URL_EVENT, onChange);
  };
}

function clearPlanParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("p")) return;
  url.searchParams.delete("p");
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(URL_EVENT));
}

/**
 * The current plan, from localStorage — or from a shared `?p=` link. A link is
 * adopted silently when nothing is saved (or it's the same plan). When it would
 * replace a different saved plan, it's surfaced as `incoming` for the user to
 * accept or dismiss rather than silently overwriting their work.
 */
export function usePlan(knownSlugs: Set<string>) {
  const [raw, , hydrated] = useStored<unknown>(KEYS.plan, null);
  const plan = useMemo(() => parsePlan(raw, knownSlugs), [raw, knownSlugs]);

  const search = useSyncExternalStore(subscribeUrl, () => window.location.search, () => "");
  const param = new URLSearchParams(search).get("p");
  const incoming = useMemo(() => (param ? decodePlan(param, knownSlugs) : null), [param, knownSlugs]);

  const hasSaved = !!plan?.items.length;
  const conflict = hydrated && incoming && hasSaved && !samePlan(plan, incoming) ? incoming : null;

  // Adopting a link is a write to storage (an external system), not React state.
  useEffect(() => {
    if (!hydrated || !param) return;
    if (!incoming) {
      clearPlanParam(); // unreadable link — drop it rather than show a broken state
      return;
    }
    if (!hasSaved || samePlan(plan, incoming)) {
      writeStored(KEYS.plan, incoming);
      clearPlanParam();
    }
  }, [hydrated, param, incoming, hasSaved, plan]);

  const setPlan = useCallback((next: Plan | null) => writeStored(KEYS.plan, next), []);

  const acceptIncoming = useCallback(() => {
    if (incoming) writeStored(KEYS.plan, incoming);
    clearPlanParam();
  }, [incoming]);

  return {
    plan: conflict ? plan : (plan ?? (hydrated ? incoming : null)),
    setPlan,
    hydrated,
    conflict,
    acceptIncoming,
    dismissIncoming: clearPlanParam,
  };
}
