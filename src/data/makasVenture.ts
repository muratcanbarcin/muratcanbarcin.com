export const MAKAS_MARK_SRC = "/assets/makas/mark.png";

/** Short public card. The longer product story stays on the support page and in MCB.ai. */
export const makasVenture = {
  command: "open ./makas",
  title: "Makas",
  product: {
    en: "Salon appointments over WhatsApp",
    tr: "WhatsApp üzerinden salon randevusu",
  },
  role: {
    en: "Co-Founder & System Architect",
    tr: "Kurucu Ortak ve Sistem Mimarı",
  },
  status: {
    en: "Live · App Store",
    tr: "Canlı · App Store",
  },
  summary: {
    en: "Owners run the agenda in the app. Clients book in WhatsApp, with no download.",
    tr: "Salon sahibi ajandayı uygulamadan yönetir. Müşteri WhatsApp’tan randevu alır, bir şey indirmez.",
  },
  stack: ["FastAPI", "Redis", "PostgreSQL", "Expo"],
  supportLabel: { en: "App Store support", tr: "App Store destek" },
  supportHref: "/makas/support",
} as const;
