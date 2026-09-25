import { ImageResponse } from "next/og";
import { SITE } from "@/seo/meta";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card: white paper, serif headline, the five-colour rule. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#ffffff",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 34, color: "#151515" }}>
            mypeptideguide<span style={{ color: "#1486c9" }}>.ai</span>
          </div>
          <div style={{ width: 260, height: 4, borderRadius: 4, backgroundImage: "linear-gradient(90deg,#d9368a,#8d43b8,#1486c9,#f47b2a,#73b84a)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 76, lineHeight: 1.02, color: "#151515", letterSpacing: -1.5 }}>
          <div>Which peptides have real</div>
          <div style={{ display: "flex" }}>
            evidence for <span style={{ fontStyle: "italic", color: "#0f6fa8", marginLeft: 20 }}>your goal?</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 36, fontSize: 24, color: "#4c5866", fontFamily: "sans-serif" }}>
          {[
            ["#73b84a", "Human trials"],
            ["#f47b2a", "Animal data only"],
            ["#8d43b8", "Anecdotal"],
          ].map(([color, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: 14, background: color }} />
              {label}
            </div>
          ))}
          <div style={{ marginLeft: "auto" }}>Free · No account · 18+</div>
        </div>
      </div>
    ),
    size,
  );
}
