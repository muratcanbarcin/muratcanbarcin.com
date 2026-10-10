import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";
import { siteConfig } from "@/data/site";
import { BRAND_PALETTE as PALETTE } from "@/lib/brand";

export const alt = siteConfig.social.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const loadFont = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

const [geistRegular, geistBold, jetbrainsMono] = await Promise.all([
  loadFont("Geist-Regular.ttf"),
  loadFont("Geist-Bold.ttf"),
  loadFont("JetBrainsMono-Medium.ttf"),
]);

const MONO = "JetBrains Mono";
const SANS = "Geist";
const host = new URL(siteConfig.url).host;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          background: PALETTE.background,
          backgroundImage: `linear-gradient(${PALETTE.surface} 1px, transparent 1px), linear-gradient(90deg, ${PALETTE.surface} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          fontFamily: SANS,
          color: PALETTE.glyph,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 22px",
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 12,
              background: PALETTE.background,
              fontFamily: MONO,
              fontSize: 30,
              letterSpacing: -0.5,
            }}
          >
            MCB
            <div style={{ display: "flex", alignItems: "center", color: PALETTE.faint, fontSize: 22 }}>
              [
              <div
                style={{
                  width: 10,
                  height: 10,
                  margin: "0 4px",
                  borderRadius: 9999,
                  background: PALETTE.accent,
                }}
              />
              ]
            </div>
          </div>
          <div style={{ display: "flex", fontFamily: MONO, fontSize: 22, color: PALETTE.subtle }}>{host}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>
            {profile.name}
          </div>
          <div style={{ display: "flex", fontSize: 40, color: PALETTE.muted, letterSpacing: -0.5 }}>
            {profile.headline.en}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: MONO,
            fontSize: 24,
            color: PALETTE.subtle,
          }}
        >
          <span style={{ color: PALETTE.accent }}>$</span>
          <span>{`[ ${siteConfig.social.imageTagline.join(" • ")} ]`}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: SANS, data: geistRegular, weight: 400, style: "normal" },
        { name: SANS, data: geistBold, weight: 700, style: "normal" },
        { name: MONO, data: jetbrainsMono, weight: 500, style: "normal" },
      ],
    },
  );
}
