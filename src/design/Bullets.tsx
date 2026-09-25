import type { Bullet } from "@/core/schema";

const DOT = { ok: "bg-green", wt: "bg-orange", bad: "bg-magenta" } as const;

/** Evidence / safety bullets: a coloured dot, then the line. */
export default function Bullets({ bullets }: { bullets: Bullet[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {bullets.map(([kind, text]) => (
        <li key={text} className="flex items-start gap-3 text-[15px] leading-[1.6] text-body">
          <span aria-hidden="true" className={`mt-[9px] h-2 w-2 shrink-0 rounded-full ${DOT[kind]}`} />
          {text}
        </li>
      ))}
    </ul>
  );
}
