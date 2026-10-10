import { ImageResponse } from "next/og";
import { BRAND_PALETTE as PALETTE } from "@/lib/brand";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * `next/og` bundles a single sans-serif face, so the monogram is drawn as stroked glyphs on a
 * fixed-width grid: three equal 6.67px cells with 2px gutters keep the mark monospaced at 32px.
 */
const GLYPHS = {
  m: "M5 20V10l2.33 5 2.34-5v10",
  c: "M18.33 10h-2.66a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2.66",
  b: "M22.33 10v10h2.17a2.5 2.5 0 0 0 0-5h-2.17M22.33 10h1.84a2.5 2.5 0 0 1 0 5",
} as const;

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "transparent" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" fill={PALETTE.background} stroke={PALETTE.border} />
          <g fill="none" stroke={PALETTE.glyph} strokeWidth="2.1" strokeLinejoin="round">
            <path d={GLYPHS.m} />
            <path d={GLYPHS.c} />
            <path d={GLYPHS.b} />
          </g>
          <rect x="4" y="23.25" width="6.67" height="1.75" rx="0.5" fill={PALETTE.accent} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
