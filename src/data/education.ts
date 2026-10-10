import type { Education } from "@/types";

export const education: readonly Education[] = [
  {
    institution: "Dokuz Eylül University",
    degree: {
      en: "Bachelor of Computer Engineering",
      tr: "Bilgisayar Mühendisliği Lisansı",
    },
    gpa: "3.27",
    maxGpa: "4.00",
    honors: {
      en: "Graduated with Honor Degree",
      tr: "Onur Öğrencisi Derecesi ile Mezun",
    },
    period: "2022 – 2026",
  },
];
