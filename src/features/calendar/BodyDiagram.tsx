import type { Site } from "@/core/plan/schedule";

/**
 * Front-view body map for site rotation. Anatomical convention: the person
 * faces you, so their left is on the right of the drawing. Back sites (glutes)
 * are dashed. `order` numbers the rotation sequence on the map.
 */
const POINTS: Record<string, { x: number; y: number; back?: boolean }> = {
  "abd-ul": { x: 111, y: 128 },
  "abd-ur": { x: 89, y: 128 },
  "abd-ll": { x: 111, y: 156 },
  "abd-lr": { x: 89, y: 156 },
  "flank-l": { x: 131, y: 146 },
  "flank-r": { x: 69, y: 146 },
  "thigh-l": { x: 118, y: 238 },
  "thigh-r": { x: 82, y: 238 },
  "arm-l": { x: 151, y: 112 },
  "arm-r": { x: 49, y: 112 },
  "delt-l": { x: 140, y: 76 },
  "delt-r": { x: 60, y: 76 },
  "glute-l": { x: 116, y: 198, back: true },
  "glute-r": { x: 84, y: 198, back: true },
  "vl-l": { x: 130, y: 250 },
  "vl-r": { x: 70, y: 250 },
};

export default function BodyDiagram({
  sites,
  next,
  recent = [],
  order,
  tone = "var(--color-blue)",
  caption = true,
}: {
  sites: Site[];
  next: Site | null;
  recent?: Site[];
  /** Site id → sequence number, drawn on the map. */
  order?: Record<string, number>;
  tone?: string;
  caption?: boolean;
}) {
  return (
    <figure className="m-0">
      <svg viewBox="0 0 200 330" role="img" aria-label={next ? `Suggested site: ${next.label}` : "Injection site map"} className="mx-auto block h-auto w-full max-w-[220px]">
        <defs>
          <linearGradient id="bodyfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7f8fa" />
            <stop offset="1" stopColor="#eff1f4" />
          </linearGradient>
        </defs>
        <g fill="url(#bodyfill)" stroke="var(--color-line-2)" strokeWidth="1.5">
          <circle cx="100" cy="30" r="19" />
          <path d="M72 58 Q100 50 128 58 L140 66 Q146 70 146 80 L136 176 Q134 188 124 190 L76 190 Q66 188 64 176 L54 80 Q54 70 60 66 Z" />
          <path d="M58 70 Q46 74 44 88 L34 176 Q33 184 40 185 Q46 186 47 178 L60 100" />
          <path d="M142 70 Q154 74 156 88 L166 176 Q167 184 160 185 Q154 186 153 178 L140 100" />
          <path d="M76 188 L72 310 Q72 318 80 318 L92 318 Q98 318 98 310 L100 206 L102 310 Q102 318 108 318 L120 318 Q128 318 128 310 L124 188 Z" />
        </g>
        {sites.map((s) => {
          const p = POINTS[s.id];
          if (!p || next?.id === s.id) return null;
          const age = recent.findIndex((r) => r.id === s.id);
          const n = order?.[s.id];
          return (
            <g key={s.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={n ? 7 : 4.5}
                fill={n ? "#fff" : age >= 0 ? "var(--color-ghost)" : "#fff"}
                fillOpacity={age >= 0 && !n ? Math.max(0.25, 1 - age * 0.2) : 1}
                stroke={n ? tone : "var(--color-ghost)"}
                strokeWidth={n ? 1.5 : 1.25}
                strokeDasharray={p.back ? "2 2" : undefined}
              />
              {n && (
                <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill={tone} fontFamily="var(--font-sans)">
                  {n}
                </text>
              )}
            </g>
          );
        })}
        {next && POINTS[next.id] && (
          <g>
            <circle cx={POINTS[next.id].x} cy={POINTS[next.id].y} r="13" fill={tone} fillOpacity="0.15" />
            <circle cx={POINTS[next.id].x} cy={POINTS[next.id].y} r="7.5" fill={tone} stroke="#fff" strokeWidth="2" strokeDasharray={POINTS[next.id].back ? "3 2" : undefined} />
            {order?.[next.id] && (
              <text x={POINTS[next.id].x} y={POINTS[next.id].y + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="var(--font-sans)">
                {order[next.id]}
              </text>
            )}
          </g>
        )}
      </svg>
      {caption && <figcaption className="mt-1 text-center text-[11px] text-muted">Front view, their left on your right. Dashed = back.</figcaption>}
    </figure>
  );
}
