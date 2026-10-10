import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Murat Can Barçin | Software Engineer (Backend & AI)",
  description:
    "Portfolio of Murat Can Barçin — Architecting scalable backend systems, applied AI solutions, and edge IoT integrations.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(
        "dark scroll-smooth motion-reduce:scroll-auto",
        geistSans.variable,
        jetbrainsMono.variable,
      )}
    >
      <body className="min-h-dvh overflow-x-clip">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
