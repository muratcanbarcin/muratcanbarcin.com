import type { ArchitectureStep } from "@/types";

export const MAKAS_MARK_SRC = "/assets/makas/mark.png";

/** Homepage card. Same density as a project: one summary, a few facts, a short pipeline. */
export const makasVenture = {
  command: "open ./makas",
  title: "Makas",
  product: {
    en: "Multi-tenant salon appointment platform",
    tr: "Çok kiracılı salon randevu platformu",
  },
  role: {
    en: "Co-Founder & System Architect",
    tr: "Kurucu Ortak ve Sistem Mimarı",
  },
  summary: {
    en: "Salon owners run scheduling, staff, and analytics in the mobile app. Clients book through WhatsApp, with no download.",
    tr: "Salon sahipleri program, personel ve analitiği mobil uygulamadan yönetir. Müşteriler WhatsApp’tan randevu alır, uygulama indirmez.",
  },
  channels: [
    { en: "App Store, very soon", tr: "App Store’da çok yakında" },
    { en: "Play Store, very soon", tr: "Play Store’da çok yakında" },
    { en: "WhatsApp, very soon", tr: "WhatsApp’ta çok yakında" },
  ],
  stack: ["FastAPI", "Redis", "PostgreSQL", "Node.js", "Meta Graph API", "Expo"],
  architecture: [
    {
      step: 1,
      title: "WhatsApp",
      description: {
        en: "The client books in chat, without an app",
        tr: "Müşteri randevuyu sohbette alır, uygulama indirmez",
      },
      technology: "WhatsApp",
    },
    {
      step: 2,
      title: "Bot",
      description: {
        en: "Signed webhook, then the conversation state machine",
        tr: "İmzalı webhook, ardından konuşma durum makinesi",
      },
      technology: "Meta Graph API · Node.js",
    },
    {
      step: 3,
      title: "Core",
      description: {
        en: "A 120-second slot lock, then scheduling and tenant checks",
        tr: "120 saniyelik slot kilidi, ardından çizelge ve kiracı kontrolü",
      },
      technology: "Redis · FastAPI",
    },
    {
      step: 4,
      title: "Owner",
      description: {
        en: "The booking is stored and the owner app is notified",
        tr: "Randevu kaydedilir, salon uygulamasına bildirim gider",
      },
      technology: "PostgreSQL · Expo",
    },
  ] satisfies readonly ArchitectureStep[],
  supportLabel: { en: "Support", tr: "Destek" },
  supportHref: "/makas/support",
} as const;
