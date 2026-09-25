import type { DoseUnit } from "./schema";

/** Positive finite numbers only — anything else reads as "not entered yet". */
export const pf = (v: string | number | null | undefined) => {
  const n = typeof v === "number" ? v : parseFloat(v ?? "");
  return isFinite(n) && n > 0 ? n : 0;
};

/** Drops trailing zeros after the decimal point, keeping whole numbers intact. */
export const trim = (s: string) => (s.includes(".") ? s.replace(/\.?0+$/, "") : s);

export const fmt = (n: number, dp = 2) => trim(n.toFixed(dp));

export const toMg = (dose: number, unit: DoseUnit) => (unit === "mg" ? dose : dose / 1000);

/** mg per mL after adding `waterMl` to a vial of `vialMg`. 0 when either is missing. */
export const concentration = (vialMg: number | null, waterMl: number | null) =>
  pf(vialMg) && pf(waterMl) ? pf(vialMg) / pf(waterMl) : 0;

/** Volume to draw for one dose, in mL. 0 when it can't be computed. */
export const drawMl = (doseMg: number, concMgPerMl: number) =>
  pf(doseMg) && pf(concMgPerMl) ? doseMg / concMgPerMl : 0;

/** Units on a U-100 insulin syringe (100 units = 1 mL). */
export const u100 = (ml: number) => ml * 100;

export const formatDose = (dose: number, unit: DoseUnit) => `${fmt(dose, 3)} ${unit}`;

export const formatRange = (r: { min: number; max: number; unit: DoseUnit }) =>
  r.min === r.max ? `${fmt(r.min, 3)} ${r.unit}` : `${fmt(r.min, 3)}–${fmt(r.max, 3)} ${r.unit}`;
