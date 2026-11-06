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
    en: "Co-founded a multi-tenant SaaS for salon scheduling, staff, bookings, and analytics. Owners use the mobile app; clients book through WhatsApp without a download. FastAPI is the scheduling source of truth, with Redis slot holds and database row locks for staff assignment.",
    tr: "Salon takvimi, personel, randevu ve analitik yönetimi için çok kiracılı SaaS platformunun kurucu ortağı. Sahipler mobil uygulamayı kullanır; müşteriler uygulama indirmeden WhatsApp’tan randevu alır. FastAPI çizelgenin doğruluk kaynağıdır; Redis slot kilitleri ve veritabanı satır kilitleri personel atamasını destekler.",
  },
  channels: [
    { en: "App Store, very soon", tr: "App Store’da çok yakında" },
    { en: "Play Store, very soon", tr: "Play Store’da çok yakında" },
    { en: "WhatsApp, very soon", tr: "WhatsApp’ta çok yakında" },
  ],
  stack: ["Python", "FastAPI", "SQLAlchemy", "Redis", "PostgreSQL", "Node.js", "Express", "Meta WhatsApp Cloud API", "Expo", "React Native"],
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
        en: "120-second Redis hold, row-locked staff assignment and application-level tenant checks",
        tr: "120 saniyelik Redis kilidi, satır kilitli personel ataması ve uygulama katmanında kiracı kontrolü",
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
