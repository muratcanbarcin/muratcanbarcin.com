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
    id: "languages",
    label: { en: "Programming Languages", tr: "Programlama Dilleri" },
    skills: ["Java", "Python", "JavaScript", "C#", "MATLAB"],
  },
  {
    id: "frameworks",
    label: { en: "Frameworks & Web Technologies", tr: "Frameworks & Web Teknolojileri" },
    skills: ["Spring Boot", "FastAPI", "RESTful API Design", "Microservices Architecture"],
  },
  {
    id: "ai-iot",
    label: { en: "AI & IoT", tr: "Yapay Zeka & IoT" },
    skills: [
      "LLM Integration & Training",
      "Computer Vision (OpenCV)",
      "Edge Computing",
      "Raspberry Pi",
      "Data Fusion",
    ],
  },
  {
    id: "databases",
    label: { en: "Database Management", tr: "Veritabanı Yönetimi" },
    skills: ["SQL", "MySQL", "PostgreSQL", "Hibernate/JPA", "Relational Database Design"],
  },
  {
    id: "engineering",
    label: { en: "Software Engineering", tr: "Yazılım Mühendisliği" },
    skills: [
      "Data Structures & Algorithms",
      "Object-Oriented Programming (OOP)",
      "Design Patterns",
      "System Design",
    ],
  },
];
