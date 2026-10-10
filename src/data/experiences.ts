import type { Experience, LocalizedString } from "@/types";

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
        'Engineered an AI microservice (Python, FastAPI) for the "Expense" B2B SaaS that extracts financial data from receipts and invoices, achieving sub-10s processing and a monthly capacity of 1M+ financial documents.',
        "Developed the backend architecture and multi-level approval workflows using Java and Spring Boot, completing the system's integration with corporate structures such as SAP.",
      ],
      tr: [
        '"Expense" isimli B2B SaaS için fiş ve faturalardan finansal verileri çıkaran yapay zeka mikroservisi (Python, FastAPI) geliştirildi; 10 sn altı işlem süresiyle aylık 1 Milyon+ finansal belge kapasitesi sağlandı.',
        "Java ve Spring Boot kullanılarak arka uç (backend) mimarisi ile çok aşamalı onay akışları ve çeşitli fonksiyonlar geliştirildi ve sistemin SAP gibi kurumsal yapılarla entegrasyonu tamamlandı.",
      ],
    },
    techStack: ["Python", "FastAPI", "Java", "Spring Boot", "SAP Integration"],
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
        "Conducted bootcamps and training programs on Backend Development, SQL, and Data Science, delivering industry-oriented knowledge through hands-on projects.",
        "Mentored participants to strengthen their technical skills and career readiness, while updating course materials in line with the latest technologies.",
      ],
      tr: [
        "Backend Geliştirme, SQL ve Veri Bilimi konularında bootcampler düzenlendi; uygulamalı projeler aracılığıyla sektöre yönelik bilgi aktarımı sağlandı.",
        "Katılımcılara teknik becerilerini ve kariyere hazırlık süreçlerini güçlendirmeleri için mentorluk yapıldı; aynı zamanda ders materyalleri en güncel teknolojilere uygun olarak güncellendi.",
      ],
    },
    techStack: ["Backend Development", "SQL", "Data Science"],
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
        "Enhanced and maintained RESTful APIs for subscription lifecycle and payment processing in the Sardis Team, fixing bugs and improving service reliability using Java, Spring Boot, and PostgreSQL.",
        "Collaborated as a backend developer on the test automation team to write and refactor over 50 automated test scripts within the Sardis framework, enhancing code maintainability and reliability.",
        "Proactively developed a user-friendly UI for the Sardis Test Automation tool, enabling non-developer QA testers to execute and monitor automation scenarios without coding.",
      ],
      tr: [
        "Sardis ekibinde abonelik yaşam döngüsü ve ödeme işlemleri için RESTful API'ler geliştirildi ve bakımı yapıldı; Java, Spring Boot ve PostgreSQL kullanılarak hatalar giderildi ve servis güvenilirliği artırıldı.",
        "Test otomasyon ekibinde backend geliştirici olarak görev alınarak Sardis altyapısında 50'den fazla otomatik test senaryosu yazıldı ve yeniden düzenlendi (refactor); böylece kodun sürdürülebilirliği ve güvenilirliği artırıldı.",
        "Yazılımcı olmayan QA test uzmanlarının kod yazmadan otomasyon senaryolarını yürütmesini ve izlemesini sağlayan, Sardis Test Otomasyon aracı için kullanıcı dostu bir arayüz (UI) proaktif olarak geliştirildi.",
      ],
    },
    techStack: ["Java", "Spring Boot", "PostgreSQL", "RESTful APIs", "Test Automation"],
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
    proofs: [{ title: "Ecothon İzmir", url: "https://ecothonizmir.com" }],
  },
];

/** Club and community roles stay on the page, outside the employment timeline. */
export function isProfessionalRole(experience: Experience): boolean {
  return experience.type !== "Leadership";
}

/** Figures already stated in the roles and the TEKNOFEST finalist project. */
export const careerHighlights: readonly {
  id: string;
  figure: string;
  label: LocalizedString;
  context: LocalizedString;
}[] = [
  {
    id: "throughput",
    figure: "1M+",
    label: { en: "financial documents / month", tr: "finansal belge / ay" },
    context: { en: "Expense extraction · Sun Group", tr: "Belge çıkarımı · Sun Group" },
  },
  {
    id: "latency",
    figure: "<10s",
    label: { en: "per document", tr: "belge başına" },
    context: { en: "FastAPI extraction service", tr: "FastAPI çıkarım servisi" },
  },
  {
    id: "automation",
    figure: "50+",
    label: { en: "automation scripts", tr: "otomasyon senaryosu" },
    context: { en: "Sardis · Turkcell", tr: "Sardis · Turkcell" },
  },
  {
    id: "teknofest",
    figure: "Finalist",
    label: { en: "TEKNOFEST", tr: "TEKNOFEST" },
    context: { en: "Lightweight C4ISR prototype", tr: "Hafif C4ISR prototipi" },
  },
];
