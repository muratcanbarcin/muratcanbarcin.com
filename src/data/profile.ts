import type { Profile, SkillGroup } from "@/types";

export const profile: Profile = {
  name: "Murat Can Barçin",
  headline: {
    en: "Software Engineer (Backend & AI)",
    tr: "Yazılım Mühendisi (Backend & AI)",
  },
  location: "Gaziantep, Türkiye",
  summary: {
    en: "Honor Computer Engineering graduate dedicated to architecting scalable backend systems, applied AI solutions, and IoT integrations. Brings corporate engineering experience from leading companies such as Turkcell and Sun Group, complemented by technical instructor experience at techcareer.net and a robust portfolio of diverse projects. Aims to blend technical expertise with strong interpersonal and leadership skills to develop high-quality, scalable products that create tangible real-world value.",
    tr: "Ölçeklenebilir backend mimarileri, yapay zeka çözümleri ve IoT entegrasyonları geliştirmeye odaklanan onur dereceli Bilgisayar Mühendisliği mezunu. Turkcell ve Sun Group gibi şirketlerde edindiği kurumsal geliştirme deneyimini; techcareer.net bünyesindeki teknik eğitmenlik tecrübesi ve başarıyla hayata geçirdiği projelerle zenginleştirmektedir. Teknik uzmanlığını güçlü sosyal ve liderlik becerileriyle harmanlayarak; gerçek dünyada somut değer yaratan, yüksek kaliteli ve ölçeklenebilir ürünler geliştirmeyi hedeflemektedir.",
  },
  valueProposition: {
    en: "Architecting scalable backend systems, resilient microservices, and applied AI at the edge.",
    tr: "Ölçeklenebilir backend sistemleri, dayanıklı mikroservisler ve uçta yapay zeka mimarileri tasarlıyorum.",
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
      "LLM Integration & Training",
      "Computer Vision (OpenCV)",
      "Edge Computing",
      "Raspberry Pi",
      "Data Fusion",
      "MATLAB",
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
    skills: ["SQL", "MySQL", "PostgreSQL", "Hibernate/JPA", "Relational Database Design"],
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
    ],
  },
];
