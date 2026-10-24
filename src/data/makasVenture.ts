import type { LocalizedString } from "@/types";

export const MAKAS_MARK_SRC = "/assets/makas/mark.png";

export interface MakasPillar {
  title: LocalizedString;
  body: LocalizedString;
}

/** Public product narrative drawn from the Makas README. Operational secrets stay out of the site. */
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
  status: {
    en: "Live production · App Store",
    tr: "Canlı üretim · App Store",
  },
  summary: {
    en: "Barber and salon bookings run through WhatsApp. The owner runs the agenda, team, services, and revenue from an Expo app. The client never downloads anything: they open the salon’s WhatsApp link and book.",
    tr: "Berber ve kuaför randevuları WhatsApp üzerinden yürür. Salon sahibi ajanda, ekip, hizmet ve ciroyu Expo uygulamasından yönetir. Müşteri uygulama indirmez; salonun WhatsApp bağlantısını açar ve randevusunu alır.",
  },
  flow: "WhatsApp → HMAC webhook → Node.js bot → Redis SET NX 120s → FastAPI → PostgreSQL / Expo push",
  stack: ["FastAPI", "PostgreSQL", "Redis", "Node.js", "Meta Graph API", "Expo SDK 54"],
  pillars: [
    {
      title: { en: "WhatsApp booking", tr: "WhatsApp randevu" },
      body: {
        en: "A salon code opens the right shop. Clients stack up to five services, pick a stylist or the first free one, and confirm a slot held by a 120-second Redis lock. A map link follows the receipt. Reminders go out inside two hours.",
        tr: "Salon kodu doğru dükkânı açar. Müşteri en fazla beş hizmet seçer, personel ya da ilk müsait çalışanı belirler ve 120 saniyelik Redis kilidiyle tutulan slotu onaylar. Fişin ardından harita bağlantısı gelir. Hatırlatma iki saat içinde iletilir.",
      },
    },
    {
      title: { en: "Owner application", tr: "Salon uygulaması" },
      body: {
        en: "Setup covers shop details, map link, working hours, team, and services. The agenda filters by day and staff. New and cancelled WhatsApp bookings arrive as high-priority, audible pushes. Analytics covers revenue, cancellations, services, and staff.",
        tr: "Kurulumda dükkân bilgisi, harita bağlantısı, çalışma saatleri, ekip ve hizmetler tanımlanır. Ajanda gün ve personele göre süzülür. Yeni ve iptal edilen WhatsApp randevuları yüksek öncelikli, sesli bildirimle düşer. Analitik ciro, iptal, hizmet ve personeli gösterir.",
      },
    },
    {
      title: { en: "System boundary", tr: "Sistem sınırı" },
      body: {
        en: "FastAPI is the source of truth for slots, price, staff assignment, and tenant scope. The Node.js bot only drives the conversation. Shop access is checked against the owner token, so another shop’s records stay unreachable.",
        tr: "FastAPI slot, fiyat, personel ataması ve kiracı sınırının tek doğruluk kaynağıdır. Node.js bot yalnızca konuşmayı yürütür. Dükkân erişimi sahip jetonuyla doğrulanır; başka bir salonun kaydı görünmez.",
      },
    },
  ] satisfies readonly MakasPillar[],
  supportLabel: { en: "App Store support", tr: "App Store destek" },
  supportHref: "/makas/support",
} as const;
