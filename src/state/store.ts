"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage-backed state for the guide, the plan and ticked-off doses.
 * v1 has no backend: this is where a user's data lives, and it never leaves
 * their browser. Read through useSyncExternalStore so server HTML renders the
 * empty state and the client fills in without a hydration mismatch.
 */

export const KEYS = {
  guide: "mpg:guide:v1",
  plan: "mpg:plan:v1",
  taken: "mpg:taken:v1",
} as const;

const EVENT = "mpg:store";

// Parsed-value cache keyed by the raw string, so getSnapshot returns a stable
// reference until the stored value actually changes.
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    // Storage blocked (private mode, policy) — behave as empty.
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeStored(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or blocked storage — the in-memory UI still works for this visit.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Returns [value, setValue, hydrated]. `hydrated` is false during server render
 * and the hydration pass, so pages can show a neutral state instead of flashing
 * "nothing saved" at a user who has a plan.
 */
export function useStored<T>(key: string, fallback: T): [T, (next: T | null) => void, boolean] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const set = useCallback((next: T | null) => writeStored(key, next), [key]);
  return [value, set, hydrated];
}
