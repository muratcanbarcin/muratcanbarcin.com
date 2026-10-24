import type { Metadata } from "next";
import { MakasSupportView } from "@/components/makas/MakasSupportView";

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
  },
};

export default function MakasSupportPage() {
  return <MakasSupportView />;
}
