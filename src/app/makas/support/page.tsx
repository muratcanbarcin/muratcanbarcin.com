import type { Metadata } from "next";
import { MakasSupportView } from "@/components/makas/MakasSupportView";

export const metadata: Metadata = {
  title: "Makas Support",
  description:
    "Support, frequently asked questions, and account deletion for the Makas salon booking app. Apple App Store Guideline 5.1.1(v).",
  alternates: { canonical: "/makas/support" },
  openGraph: {
    title: "Makas Support",
    description:
      "Support, frequently asked questions, and account deletion for the Makas salon booking app. Apple App Store Guideline 5.1.1(v).",
    url: "/makas/support",
  },
};

export default function MakasSupportPage() {
  return <MakasSupportView />;
}
