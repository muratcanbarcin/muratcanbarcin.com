import type { MakasSupportField } from "@/types";

export interface MakasFaqItem {
  question: string;
  answer: string;
}

export const makasSupportContent = {
  title: "✂️ Makas Destek & İletişim",
  eyebrow: "App Store Support",
  overviewTitle: "Uygulama",
  overview:
    "Makas, berber ve kuaför işletmeleri için uçtan uca randevu platformudur. Salon sahipleri Expo mobil uygulamasından program, personel ve analitiği yönetir. Müşteriler uygulama indirmeden WhatsApp botu ile randevu alır.",
  overviewDetail:
    "Salon sahipleri randevu, personel ve doluluk bilgisini telefondan yönetir. Müşteri tarafında indirme yoktur; randevu WhatsApp üzerinden açılır, onaylanır ve iptal edilir.",
  faqTitle: "Sık sorulan sorular",
  faq: [
    {
      question: "WhatsApp OTP kodu gelmediğinde ne yapmalıyım?",
      answer:
        "Doğrulama kodunun geçerliliği 2 dakikadır. Numaranızı ülke koduyla birlikte, WhatsApp’ın kayıtlı olduğu hat üzerinden girin ve kodu bir kez daha isteyin. Makas işletme sohbetini engellediyseniz veya WhatsApp bildirimleri kapalıysa mesaj düşmez. Sorun sürerse aşağıdaki formdan “Randevu/WhatsApp Hatası” konusunu seçin.",
    },
    {
      question: "Randevu bildirimleri telefonuma sesli olarak düşmüyor mu?",
      answer:
        "Yeni ve iptal edilen randevularda salon uygulamasına yüksek öncelikli, sesli bir bildirim gönderilir. Ses gelmiyorsa iOS Ayarlar > Bildirimler > Makas bölümünden bildirim iznini ve sesi açın. Odak modunun Makas’ı susturmadığını kontrol edin ve telefonun sessiz modda olmadığından emin olun.",
    },
    {
      question: "Dükkan konumumu ve harita linkimi nasıl güncellerim?",
      answer:
        "Salon sahibi uygulamasındaki dükkan profilinden adresinizi ve harita bağlantınızı güncelleyin. WhatsApp botu, müşteriye konum paylaşırken bu bağlantıyı kullanır. Ekranı bulamıyorsanız formdan dükkan adınızı yazarak “Teknik Sorun” konusuyla talep bırakın.",
    },
    {
      question: "Personel çalışma saatlerini ve izin günlerini nasıl yönetirim?",
      answer:
        "Mobil uygulamadaki personel bölümünden her çalışan için çalışma saatlerini ve izin günlerini tanımlayın. Sistem yalnızca müsait personel ve boş saatlere randevu yazar. Aynı slota gelen eşzamanlı talepler kilitlenir; çifte rezervasyon oluşmaz.",
    },
  ] satisfies readonly MakasFaqItem[],
  deletionTitle: "Hesap ve veri silme",
  deletionGuideline: "Apple App Store Guideline 5.1.1(v)",
  deletionIntro:
    "Salon sahibi hesabını ve bağlı işletme verilerini dilediği zaman silebilir. Silme işlemi dükkan kaydını, personel kayıtlarını ve hesap kimlik bilgilerini kapsar ve 48 saat içinde tamamlanır.",
  deletionSteps: [
    "Makas mobil uygulamasında Ayarlar > Hesabı Sil yolunu izleyin.",
    "Uygulamaya erişemiyorsanız aşağıdaki formu konu olarak “Hesap Silme Talebi” seçerek gönderin. Dükkan adınızı ve kayıtlı e-postanızı yazın.",
    "Talep alındıktan sonra dükkan verileri, personel kayıtları ve kimlik bilgileri 48 saat içinde silinir.",
  ],
  deletionEnglishTitle: "Account deletion",
  deletionEnglish:
    "Salon owners can delete their account in the Makas iOS app via Settings > Delete Account (Ayarlar > Hesabı Sil). They can also submit the form on this page with the subject “Hesap Silme Talebi”. Shop data, staff records, and credentials are deleted within 48 hours. This page is provided for App Store Review Guideline 5.1.1(v).",
  formTitle: "Destek talebi",
  formIntro: "Talebiniz doğrudan Makas destek ekibine iletilir. Hesap silmek için konuda “Hesap Silme Talebi”ni seçin.",
  success: "Destek talebiniz ekibimize iletildi, en kısa sürede dönüş yapılacaktır",
  submit: "Talebi gönder",
  submitting: "Gönderiliyor",
  sendAnother: "Başka bir talep gönder",
  labels: {
    name: "Ad Soyad",
    email: "E-posta",
    phone: "Telefon Numarası",
    shopName: "Dükkan Adı (Opsiyonel)",
    subject: "Konu Seçimi",
    message: "Mesaj",
  },
  placeholders: {
    name: "Adınız ve soyadınız",
    email: "ornek@salon.com",
    phone: "+90 5xx xxx xx xx",
    shopName: "Salon adı",
    subject: "Konu seçin",
    message: "Sorununuzu kısaca yazın",
  },
  errors: {
    name: "Ad soyad gerekli.",
    email: "Geçerli bir e-posta adresi girin.",
    phone: "Telefon numarası en fazla 32 karakter olabilir.",
    shopName: "Dükkan adı en fazla 120 karakter olabilir.",
    subject: "Bir konu seçin.",
    message: "Mesaj gerekli.",
    generic: "Talep iletilemedi. Bağlantınızı kontrol edip yeniden deneyin.",
    rateLimited: "Kısa süre içinde çok fazla talep gönderildi. Lütfen biraz sonra tekrar deneyin.",
  } satisfies Record<MakasSupportField | "generic" | "rateLimited", string>,
} as const;
