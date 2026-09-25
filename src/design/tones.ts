import type { CSSProperties } from "react";

/** The brand family as tint sets: a colour, a deeper text shade, a wash. */
export const TONES = {
  blue: { tone: "#1486c9", deep: "#0f6fa8", wash: "#e8f3fa" },
  cyan: { tone: "#14b8c9", deep: "#0e8c9e", wash: "#e6f7f9" },
  royal: { tone: "#2e5bd7", deep: "#2447ad", wash: "#e9eefb" },
  indigo: { tone: "#5a55d6", deep: "#3f3ab3", wash: "#eeedfb" },
  purple: { tone: "#8d43b8", deep: "#6f2f96", wash: "#f3ecf9" },
  green: { tone: "#73b84a", deep: "#4e8a2c", wash: "#eef6e8" },
  orange: { tone: "#f47b2a", deep: "#b8561a", wash: "#fef0e6" },
  magenta: { tone: "#d9368a", deep: "#b52a72", wash: "#fbe9f2" },
} as const;

export type ToneKey = keyof typeof TONES;

/** Inline CSS variables that `.tone-card`, `.tone-icon` and `.result-panel` read. */
export const toneStyle = (k: ToneKey) =>
  ({ "--tone": TONES[k].tone, "--tone-deep": TONES[k].deep, "--tone-wash": TONES[k].wash }) as CSSProperties;

/** Cycle through the family, for lists. */
export const toneAt = (i: number): ToneKey => (["blue", "purple", "green", "orange", "magenta", "cyan", "royal", "indigo"] as const)[i % 8];
