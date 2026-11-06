import type { Experience } from "@/types";

export const experiences: readonly Experience[] = [
  {
    id: "sun-group",
    role: {
      en: "Software Engineer (AI & Backend)",
      tr: "Yazılım Mühendisi (AI & Backend)",
    },
    company: "Sun Group",
    location: "İzmir, Türkiye",
    type: "Part-time",
    period: { start: "2026-03", end: "2026-06" },
    highlights: {
      en: [
        'Engineered an AI microservice (Python, FastAPI) for the "Expense" B2B SaaS that extracts financial data from receipts and invoices, averaging under 10 seconds per document in tests, with an estimated capacity of 1M+ documents per month.',
        "Developed the backend architecture and multi-level approval workflows using Java and Spring Boot, preparing the platform for integration with external systems such as SAP.",
      ],
      tr: [
        '"Expense" isimli B2B SaaS için fiş ve faturalardan finansal verileri çıkaran yapay zeka mikroservisi (Python, FastAPI) geliştirildi; testlerde belge başına ortalama 10 saniyenin altında işlem süresi ve aylık 1M+ belge kapasitesi tahmini elde edildi.',
        "Java ve Spring Boot ile backend mimarisi ve çok seviyeli onay süreçleri geliştirildi; platform SAP gibi harici sistemlerle entegrasyona hazır hale getirildi.",
      ],
    },
    techStack: ["Python", "FastAPI", "Java", "Spring Boot", "External System Integration Readiness"],
    metrics: [
      {
        id: "throughput",
        figure: "1M+",
        label: { en: "estimated documents / month", tr: "aylık tahmini belge kapasitesi" },
      },
      {
        id: "latency",
        figure: "<10s",
        label: { en: "average per document in tests", tr: "testlerde belge başına ortalama" },
      },
      {
        id: "sap",
        figure: "SAP",
        label: { en: "external integration readiness", tr: "harici entegrasyona hazırlık" },
      },
    ],
  },
  {
    id: "techcareer",
    role: {
      en: "Software & Data Science Instructor",
      tr: "Yazılım & Veri Bilimi Eğitmeni",
    },
    company: "techcareer.net",
    companyUrl: "https://www.techcareer.net",
    location: "Hybrid",
    type: "Instructor",
    period: { start: "2025-07", end: "2025-12" },
    highlights: {
      en: [
        "Delivered two bootcamps on Python & Data Science and SQL, providing hands-on technical training to 150+ university-level students per program.",
        "Mentored participants on capstone projects, providing technical guidance, troubleshooting support, and practical problem-solving assistance.",
      ],
      tr: [
        "Python & Data Science ve SQL alanlarında iki bootcamp düzenlendi; her programda 150'den fazla üniversite düzeyindeki katılımcıya uygulamalı teknik eğitim verildi.",
        "Katılımcıların bitirme projelerine mentorluk yapıldı; teknik sorular, hata giderme ve problem çözme süreçlerinde rehberlik sağlandı.",
      ],
    },
    techStack: ["Python", "SQL", "Data Science"],
    metrics: [
      {
        id: "tracks",
        figure: "2",
        label: { en: "separate bootcamp instructorships", tr: "ayrı bootcamp eğitmenliği" },
      },
      {
        id: "cohort",
        figure: "150+",
        label: { en: "university-level+ students in each", tr: "her birinde üniversite seviyesi+ öğrenci" },
      },
    ],
  },
  {
    id: "turkcell",
    role: {
      en: "Backend Developer Intern",
      tr: "Backend Developer Stajyeri",
    },
    company: "Turkcell",
    companyUrl: "https://www.turkcell.com.tr",
    location: "İstanbul, Türkiye",
    type: "Internship",
    period: { start: "2025-01", end: "2025-06" },
    highlights: {
      en: [
        "Contributed to bug fixes and technical analysis alongside a mentor in the Sardis team, supporting subscription and payment systems using Java, Spring Boot, and PostgreSQL.",
        "Collaborated as a backend developer on the test automation team to write and refactor over 50 automated test scripts within the Sardis framework, enhancing code maintainability and reliability.",
        "Proactively developed a user-friendly UI for the Sardis Test Automation tool, enabling non-developer QA testers to execute scenarios and generate reports without interacting with source code.",
      ],
      tr: [
        "Sardis ekibinde mentörle birlikte hata giderme ve teknik analiz çalışmalarına katkı sağlandı; Java, Spring Boot ve PostgreSQL ile abonelik ve ödeme sistemleri desteklendi.",
        "Test otomasyon ekibinde backend geliştirici olarak görev alınarak Sardis altyapısında 50'den fazla otomatik test senaryosu yazıldı ve yeniden düzenlendi (refactor); böylece kodun sürdürülebilirliği ve güvenilirliği artırıldı.",
        "Yazılımcı olmayan QA test uzmanlarının kaynak kodla etkileşime girmeden senaryoları çalıştırmasını ve rapor oluşturmasını sağlayan, Sardis Test Otomasyon aracı için kullanıcı dostu bir arayüz (UI) proaktif olarak geliştirildi.",
      ],
    },
    techStack: ["Java", "Spring Boot", "PostgreSQL", "RESTful APIs", "Test Automation"],
    metrics: [
      {
        id: "scripts",
        figure: "50+",
        label: { en: "Sardis automation scripts", tr: "Sardis otomasyon senaryosu" },
      },
      {
        id: "spring",
        figure: "Spring",
        label: { en: "subscription & payment services", tr: "abonelik ve ödeme servisleri" },
      },
    ],
  },
  {
    id: "gdsc-deu",
    role: {
      en: "Organization Coordinator",
      tr: "Organizasyon Koordinatörü",
    },
    company: "Google Developer Student Clubs - DEU",
    location: "İzmir, Türkiye",
    type: "Leadership",
    period: { start: "2023-09", end: "2024-08" },
    highlights: {
      en: [
        'Led the organization of 20+ technical events and hackathons, notably executing "Ecothon," the largest UN Sustainable Development Goals-based hackathon in the Aegean region.',
      ],
      tr: [
        'Ege Bölgesi\'nin en büyük BM Sürdürülebilir Kalkınma Amaçları odaklı hackathonu "Ecothon" başta olmak üzere teknik eğitimler, networking buluşmaları, kariyer etkinlikleri ve hackathonlar dahil 20\'den fazla etkinliğin organizasyonuna liderlik edildi.',
      ],
    },
    techStack: [],
    metrics: [
      {
        id: "events",
        figure: "20+",
        label: { en: "events and hackathons", tr: "etkinlik ve hackathon" },
      },
      {
        id: "ecothon",
        figure: "Ecothon",
        label: { en: "largest SDG hackathon in the Aegean", tr: "Ege'nin en büyük SKA hackathonu" },
      },
    ],
    proofs: [{ title: "Ecothon İzmir", url: "https://ecothonizmir.com" }],
  },
];

/** Community roles stay on the page, outside the employment timeline. */
export function isProfessionalRole(experience: Experience): boolean {
  return experience.type !== "Leadership";
}
