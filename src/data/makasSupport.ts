import type { LocalizedString, MakasSupportField, MakasSupportSubject } from "@/types";

export interface MakasFaqItem {
  question: LocalizedString;
  answer: LocalizedString;
}

export const MAKAS_SUBJECT_LABELS: Record<MakasSupportSubject, LocalizedString> = {
  "Teknik Sorun": { en: "Technical issue", tr: "Teknik sorun" },
  "Randevu/WhatsApp Hatası": { en: "Booking / WhatsApp error", tr: "Randevu / WhatsApp hatası" },
  "Hesap Silme Talebi": { en: "Account deletion request", tr: "Hesap silme talebi" },
  "Genel Soru": { en: "General question", tr: "Genel soru" },
};

export const makasSupportContent = {
  home: { en: "Home", tr: "Ana sayfa" },
  eyebrow: { en: "Support", tr: "Destek" },
  title: { en: "Support and contact", tr: "Destek ve iletişim" },
  lede: {
    en: "Help for salon owners on the mobile app, and for clients booking through WhatsApp.",
    tr: "Mobil uygulamadaki salon sahipleri ve WhatsApp’tan randevu alan müşteriler için yardım.",
  },
  deletionTitle: { en: "Account and data deletion", tr: "Hesap ve veri silme" },
  deletionGuideline: "Apple App Store Guideline 5.1.1(v)",
  deletionIntro: {
    en: "A salon owner can delete the account and the shop data attached to it at any time. Deletion covers the shop record, staff records, and credentials, and is completed within 48 hours.",
    tr: "Salon sahibi hesabını ve bu hesaba bağlı dükkân verilerini dilediği zaman silebilir. Silme işlemi dükkân kaydını, personel kayıtlarını ve kimlik bilgilerini kapsar ve 48 saat içinde tamamlanır.",
  },
  deletionSteps: [
    {
      en: "In the Makas app, open Settings and choose Delete Account.",
      tr: "Makas uygulamasında Ayarlar bölümünü açın ve Hesabı Sil’i seçin.",
    },
    {
      en: "If you cannot open the app, send the form with the subject “Account deletion request”. Include the shop name and the email on the account.",
      tr: "Uygulamayı açamıyorsanız formu “Hesap silme talebi” konusuyla gönderin. Dükkân adını ve hesaptaki e-postayı yazın.",
    },
    {
      en: "After the request is received, shop data, staff records, and credentials are deleted within 48 hours.",
      tr: "Talep alındıktan sonra dükkân verileri, personel kayıtları ve kimlik bilgileri 48 saat içinde silinir.",
    },
  ] satisfies readonly LocalizedString[],
  faqTitle: { en: "Common questions", tr: "Sık sorulan sorular" },
  faq: [
    {
      question: {
        en: "The WhatsApp verification code never arrived. What should I do?",
        tr: "WhatsApp doğrulama kodu gelmedi. Ne yapmalıyım?",
      },
      answer: {
        en: "The code is valid for 2 minutes. Enter the number with its country code, on the line registered with WhatsApp, and request it once more. A blocked Makas chat or disabled WhatsApp notifications will also stop the message. If it still fails, send the form with the subject “Booking / WhatsApp error”.",
        tr: "Kod 2 dakika geçerlidir. Numarayı ülke koduyla, WhatsApp’ın kayıtlı olduğu hattan girin ve kodu bir kez daha isteyin. Makas sohbeti engelliyse veya WhatsApp bildirimleri kapalıysa mesaj düşmez. Sürerse formu “Randevu / WhatsApp hatası” konusuyla gönderin.",
      },
    },
    {
      question: {
        en: "Booking alerts are not playing a sound.",
        tr: "Randevu bildirimleri sesli gelmiyor.",
      },
      answer: {
        en: "A new or cancelled booking sends a high-priority, audible alert to the salon app. If you hear nothing, open the phone’s notification settings for Makas and allow alerts and sound. Check that Focus or Do Not Disturb is not silencing the app, and that the phone is not on silent.",
        tr: "Yeni veya iptal edilen randevu, salon uygulamasına yüksek öncelikli ve sesli bir bildirim gönderir. Ses yoksa telefonun bildirim ayarlarından Makas için bildirim ve ses iznini açın. Odak ya da Rahatsız Etme modunun uygulamayı susturmadığını ve telefonun sessizde olmadığını kontrol edin.",
      },
    },
    {
      question: {
        en: "How do I update the shop address and map link?",
        tr: "Dükkân konumunu ve harita bağlantısını nasıl güncellerim?",
      },
      answer: {
        en: "In the owner app, edit Shop location / Map link from setup or from Settings. The WhatsApp bot uses that link when it shares directions after a booking. If you cannot find the field, send a technical-issue request and include the shop name.",
        tr: "Salon sahibi uygulamasında kurulumu veya Ayarlar’ı açıp Dükkân Konumu / Harita Bağlantısı alanını güncelleyin. WhatsApp botu, randevu sonrası yol tarifinde bu bağlantıyı kullanır. Alanı bulamıyorsanız dükkân adınızı yazarak teknik sorun talebi bırakın.",
      },
    },
    {
      question: {
        en: "How do I set staff hours and days off?",
        tr: "Personel saatlerini ve izin günlerini nasıl ayarlarım?",
      },
      answer: {
        en: "During setup, and later from the team section, set each person’s working hours and days off. Makas only offers times where a staff member is free. Two clients confirming the same slot are separated by a short hold, so the hour is not booked twice.",
        tr: "Kurulumda ve daha sonra ekip bölümünden her çalışan için çalışma saatini ve izin gününü tanımlayın. Makas yalnızca personelin müsait olduğu saatleri sunar. Aynı slotu onaylayan iki müşteri kısa bir kilitle ayrılır; saat iki kez satılmaz.",
      },
    },
  ] satisfies readonly MakasFaqItem[],
  formTitle: { en: "Send a request", tr: "Talep gönderin" },
  formIntro: {
    en: "The note goes directly to the Makas support desk. For deletion, choose “Account deletion request”.",
    tr: "Not doğrudan Makas destek ekibine gider. Silme için “Hesap silme talebi” konusunu seçin.",
  },
  success: {
    en: "Your request has been sent to the team. We will reply as soon as we can.",
    tr: "Destek talebiniz ekibimize iletildi, en kısa sürede dönüş yapılacaktır.",
  },
  submit: { en: "Send request", tr: "Talebi gönder" },
  submitting: { en: "Sending", tr: "Gönderiliyor" },
  sendAnother: { en: "Send another request", tr: "Başka bir talep gönder" },
  labels: {
    name: { en: "Full name", tr: "Ad soyad" },
    email: { en: "Email", tr: "E-posta" },
    phone: { en: "Phone number", tr: "Telefon numarası" },
    shopName: { en: "Shop name (optional)", tr: "Dükkân adı (opsiyonel)" },
    subject: { en: "Subject", tr: "Konu" },
    message: { en: "Message", tr: "Mesaj" },
  } satisfies Record<MakasSupportField, LocalizedString>,
  placeholders: {
    name: { en: "Your name", tr: "Adınız ve soyadınız" },
    email: { en: "you@salon.com", tr: "ornek@salon.com" },
    phone: { en: "+90 5xx xxx xx xx", tr: "+90 5xx xxx xx xx" },
    shopName: { en: "Shop name", tr: "Salon adı" },
    subject: { en: "Choose a subject", tr: "Konu seçin" },
    message: { en: "Describe the issue in a few sentences", tr: "Sorunu birkaç cümleyle yazın" },
  } satisfies Record<MakasSupportField, LocalizedString>,
  errors: {
    name: { en: "Enter your name.", tr: "Ad soyad gerekli." },
    email: { en: "Enter a valid email address.", tr: "Geçerli bir e-posta adresi girin." },
    phone: { en: "Phone number must be 32 characters or fewer.", tr: "Telefon numarası en fazla 32 karakter olabilir." },
    shopName: { en: "Shop name must be 120 characters or fewer.", tr: "Dükkân adı en fazla 120 karakter olabilir." },
    subject: { en: "Choose a subject.", tr: "Bir konu seçin." },
    message: { en: "Write a message.", tr: "Mesaj gerekli." },
    generic: { en: "The request could not be sent. Check your connection and try again.", tr: "Talep iletilemedi. Bağlantınızı kontrol edip yeniden deneyin." },
    rateLimited: {
      en: "Too many requests in a short time. Please try again shortly.",
      tr: "Kısa süre içinde çok fazla talep gönderildi. Lütfen biraz sonra tekrar deneyin.",
    },
  } satisfies Record<MakasSupportField | "generic" | "rateLimited", LocalizedString>,
  footer: { en: "Makas · Salon booking", tr: "Makas · Salon randevu" },
} as const;
