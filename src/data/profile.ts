import type { Profile, SkillGroup } from "@/types";

export const profile: Profile = {
  name: "Murat Can Barçin",
  headline: {
    en: "Software Engineer | Backend & Applied AI",
    tr: "Yazılım Mühendisi | Backend & Yapay Zeka",
  },
  location: "İstanbul, Türkiye",
  summary: {
    en: "Computer Engineering graduate with honors, focused on backend development and applied artificial intelligence. Brings hands-on software engineering experience at Turkcell and Sun Group, complemented by technical instructor experience at techcareer.net and a diverse portfolio of projects. Aims to build reliable, scalable software solutions. Based in İstanbul and open to relocation.",
    tr: "Backend geliştirme ve uygulamalı yapay zeka alanlarına odaklanan, onur derecesiyle mezun Bilgisayar Mühendisi. Turkcell ve Sun Group'ta edindiği uygulamalı yazılım mühendisliği deneyimini, techcareer.net bünyesindeki teknik eğitmenlik tecrübesi ve çeşitli projelerden oluşan portföyüyle desteklemektedir. Güvenilir ve ölçeklenebilir yazılım çözümleri geliştirmeyi hedeflemektedir. İstanbul'da yaşıyor ve taşınmaya açık.",
  },
  valueProposition: {
    en: "Architecting scalable backend systems, resilient microservices, and applied AI solutions.",
    tr: "Ölçeklenebilir backend sistemleri, dayanıklı mikroservisler ve uygulamalı yapay zeka çözümleri geliştiriyorum.",
  },
  socials: [
    { platform: "github", url: "https://github.com/muratcanbarcin", handle: "muratcanbarcin" },
    {
      platform: "linkedin",
      url: "https://www.linkedin.com/in/muratcanbarcin",
      handle: "muratcanbarcin",
    },
    { platform: "email", url: "mailto:muratcanbarcin@gmail.com", handle: "muratcanbarcin@gmail.com" },
  ],
  languages: [
    {
      name: { en: "English", tr: "İngilizce" },
      level: { en: "B2", tr: "B2" },
    },
  ],
};

export const skills: readonly SkillGroup[] = [
  {
    id: "backend-systems",
    label: { en: "Backend Systems", tr: "Backend Sistemleri" },
    description: {
      en: "Service design, APIs and enterprise integrations.",
      tr: "Servis tasarımı, API'ler ve kurumsal entegrasyonlar.",
    },
    icon: "server",
    skills: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "Spring Data JPA (Hibernate)",
      "Python",
      "FastAPI",
      "RESTful API Design",
      "Microservices Architecture",
      "JavaScript",
      "C#",
    ],
  },
  {
    id: "ai-edge",
    label: { en: "AI & Edge", tr: "Yapay Zeka & Edge" },
    description: {
      en: "Applied models, computer vision and on-device inference.",
      tr: "Uygulamalı modeller, bilgisayarlı görü ve cihaz üzerinde çıkarım.",
    },
    icon: "cpu",
    skills: [
      "Machine Learning (Training & Evaluation)",
      "LLM Integration",
      "LLM Fine-Tuning",
      "Retrieval-Augmented Generation (RAG)",
      "Computer Vision (OpenCV)",
      "Edge Computing",
      "Raspberry Pi",
      "Data Fusion",
    ],
  },
  {
    id: "databases-data",
    label: { en: "Databases & Data", tr: "Veritabanları & Veri" },
    description: {
      en: "Relational modelling, persistence and data access layers.",
      tr: "İlişkisel modelleme, kalıcılık ve veri erişim katmanları.",
    },
    icon: "database",
    skills: ["SQL", "MySQL", "PostgreSQL", "PostGIS", "Redis", "Relational Database Design"],
  },
  {
    id: "software-architecture",
    label: { en: "Software Architecture", tr: "Yazılım Mimarisi" },
    description: {
      en: "Fundamentals that keep systems maintainable at scale.",
      tr: "Sistemleri ölçekte sürdürülebilir kılan temeller.",
    },
    icon: "layers",
    skills: [
      "System Design",
      "Design Patterns",
      "Object-Oriented Programming (OOP)",
      "Data Structures & Algorithms",
      "Git",
    ],
  },
];
