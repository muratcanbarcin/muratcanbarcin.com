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
          width: "100%",
          height: "100%",
          padding: 28,
          background: "#030712",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "48px 56px",
            border: `1px solid ${PALETTE.border}`,
            backgroundColor: PALETTE.background,
            backgroundImage: `linear-gradient(${PALETTE.surface} 1px, transparent 1px), linear-gradient(90deg, ${PALETTE.surface} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            fontFamily: SANS,
            color: PALETTE.glyph,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                border: `1px solid ${PALETTE.border}`,
                background: PALETTE.background,
                fontFamily: MONO,
                fontSize: 22,
                letterSpacing: 1.5,
              }}
            >
              MCB
              <div style={{ width: 8, height: 8, borderRadius: 999, background: PALETTE.accent }} />
            </div>
            <div style={{ display: "flex", fontFamily: MONO, fontSize: 20, color: PALETTE.subtle, letterSpacing: 2 }}>
              PERSON
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  padding: "8px 14px",
                  border: `1px solid ${PALETTE.border}`,
                  background: PALETTE.background,
                  color: PALETTE.muted,
                  fontSize: 26,
                  letterSpacing: -0.4,
                }}
              >
                {siteConfig.social.imageRole}
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>
              {profile.name}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {siteConfig.social.imageTagline.map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    padding: "10px 16px",
                    border: `1px solid ${PALETTE.border}`,
                    borderRadius: 999,
                    background: PALETTE.background,
                    color: PALETTE.glyph,
                    fontFamily: MONO,
                    fontSize: 20,
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: PALETTE.accent }} />
            <div style={{ display: "flex", fontFamily: MONO, fontSize: 26, letterSpacing: -0.4 }}>{host}</div>
          </div>
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
