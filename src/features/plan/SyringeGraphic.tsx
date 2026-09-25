/**
 * A U-100 insulin syringe, filled to the units to draw. Picks the smallest
 * standard barrel (30 / 50 / 100 units) the dose fits in, so the reading is
 * as legible as it would be in the hand.
 */
export default function SyringeGraphic({ units, tone = "#1486c9" }: { units: number | null; tone?: string }) {
  const capacity = units === null ? 50 : units <= 30 ? 30 : units <= 50 ? 50 : 100;
  const fill = units === null ? 0 : Math.min(units, capacity);
  const x0 = 62; // barrel start (plunger side)
  const x1 = 302; // barrel end (needle side)
  const w = x1 - x0;
  const px = (u: number) => x1 - (u / capacity) * w; // 0 at the needle
  const major = capacity === 100 ? 10 : 5;
  const ticks = Array.from({ length: capacity / (capacity === 100 ? 2 : 1) + 1 }, (_, i) => i * (capacity === 100 ? 2 : 1));

  return (
    <figure className="m-0">
      <svg viewBox="0 0 360 96" role="img" aria-label={units === null ? "Syringe" : `Draw to ${units} units on a ${capacity}-unit syringe`} className="block h-auto w-full max-w-[420px]">
        {/* needle */}
        <rect x={x1 + 6} y="45" width="46" height="2.5" fill="var(--color-ghost)" />
        <path d={`M${x1} 40 h6 v12 h-6 z`} fill="var(--color-line-2)" />
        {/* barrel */}
        <rect x={x0} y="32" width={w} height="28" rx="3" fill="#fff" stroke="var(--color-line-2)" strokeWidth="1.5" />
        {/* liquid */}
        {fill > 0 && <rect x={px(fill)} y="33.5" width={x1 - px(fill) - 1} height="25" fill={tone} fillOpacity="0.22" />}
        {/* plunger */}
        <rect x={px(fill) - 3} y="30" width="4" height="32" rx="1" fill="var(--color-ink)" />
        <rect x="14" y="41" width={Math.max(0, px(fill) - 17)} height="10" rx="2" fill="var(--color-line-2)" />
        <rect x="6" y="28" width="9" height="36" rx="2" fill="var(--color-ink)" />
        {/* ticks */}
        {ticks.map((u) => {
          const x = px(u);
          const isMajor = u % major === 0;
          return (
            <g key={u}>
              <line x1={x} x2={x} y1="60" y2={isMajor ? 68 : 65} stroke="var(--color-muted)" strokeWidth="1" />
              {isMajor && (
                <text x={x} y="80" textAnchor="middle" fontSize="9" fill="var(--color-muted)" fontFamily="var(--font-sans)">
                  {u}
                </text>
              )}
            </g>
          );
        })}
        {/* marker */}
        {units !== null && (
          <g>
            <line x1={px(fill)} x2={px(fill)} y1="14" y2="30" stroke={tone} strokeWidth="1.5" />
            <text x={px(fill)} y="11" textAnchor="middle" fontSize="11" fontWeight="700" fill={tone} fontFamily="var(--font-sans)">
              {units} u
            </text>
          </g>
        )}
      </svg>
      <figcaption className="mt-1 text-[11.5px] text-muted">
        {units === null ? "Enter dose, vial and water to see where to draw to." : `${capacity}-unit U-100 syringe. Draw to the ${units}-unit mark.`}
        {units !== null && units > capacity && " More than one syringe."}
      </figcaption>
    </figure>
  );
}
