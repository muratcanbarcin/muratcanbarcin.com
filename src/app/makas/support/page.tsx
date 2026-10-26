import type { Metadata } from "next";
import { MakasSupportView } from "@/components/makas/MakasSupportView";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Makas Support",
  description:
    "Support, frequently asked questions, and account deletion for the Makas salon booking app.",
  alternates: { canonical: "/makas/support" },
  openGraph: {
    title: "Makas Support",
    description:
      "Support, frequently asked questions, and account deletion for the Makas salon booking app.",
    url: "/makas/support",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteConfig.social.imageAlt,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/twitter-image"],
  },
};

export default function MakasSupportPage() {
  return <MakasSupportView />;
}
