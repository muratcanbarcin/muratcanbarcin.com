export const MAKAS_SUPPORT_SUBJECTS = [
  "Teknik Sorun",
  "Randevu/WhatsApp Hatası",
  "Hesap Silme Talebi",
  "Genel Soru",
] as const;

export type MakasSupportSubject = (typeof MAKAS_SUPPORT_SUBJECTS)[number];

export type MakasSupportField = "name" | "email" | "phone" | "shopName" | "subject" | "message";

export interface MakasSupportPayload {
  name: string;
  email: string;
  phone: string;
  shopName: string;
  subject: MakasSupportSubject;
  message: string;
}

export type MakasSupportFormValues = {
  [Key in MakasSupportField]: Key extends "subject" ? MakasSupportSubject | "" : string;
};
