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

/** Categories, order and skill names mirror the current English/Turkish CVs. */
export const skills: readonly SkillGroup[] = [
  {
    id: "programming-languages",
    label: { en: "Programming Languages", tr: "Programlama Dilleri" },
    description: {
      en: "Languages used across backend services and application projects.",
      tr: "Backend servislerinde ve uygulama projelerinde kullanılan diller.",
    },
    icon: "code",
    skills: ["Java", "Python", "JavaScript", "C#"],
  },
  {
    id: "backend-development",
    label: { en: "Backend Development", tr: "Backend Geliştirme" },
    description: {
      en: "Service development, security, persistence and API architecture.",
      tr: "Servis geliştirme, güvenlik, veri erişimi ve API mimarisi.",
    },
    icon: "server",
    skills: [
      "Spring Boot",
      "Spring Security",
      "Spring Data JPA (Hibernate)",
      "FastAPI",
      "REST APIs",
      "Microservices Architecture",
    ],
  },
  {
    id: "databases",
    label: { en: "Databases", tr: "Veritabanları" },
    description: {
      en: "Relational data, queries and in-memory storage.",
      tr: "İlişkisel veri, sorgular ve bellek içi depolama.",
    },
    icon: "database",
    skills: ["SQL", "PostgreSQL", "MySQL", "Redis"],
  },
  {
    id: "ai-data",
    label: { en: "AI & Data", tr: "Yapay Zekâ ve Veri" },
    description: {
      en: "Model training, language models, retrieval, vision and data fusion.",
      tr: "Model eğitimi, dil modelleri, bilgi erişimi, görüntü işleme ve veri füzyonu.",
    },
    icon: "cpu",
    skills: [
      "Machine Learning (Model Training & Evaluation)",
      "LLM Integration",
      "LLM Fine-Tuning",
      "Retrieval-Augmented Generation (RAG)",
      "Computer Vision",
      "Data Fusion",
    ],
  },
  {
    id: "software-engineering-tools",
    label: { en: "Software Engineering & Tools", tr: "Yazılım Mühendisliği ve Araçlar" },
    description: {
      en: "Design fundamentals, algorithms and version control.",
      tr: "Tasarım temelleri, algoritmalar ve sürüm kontrolü.",
    },
    icon: "layers",
    skills: [
      "System Design",
      "Object-Oriented Programming (OOP)",
      "Data Structures & Algorithms",
      "Design Patterns",
      "Git",
    ],
  },
];
