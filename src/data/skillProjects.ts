import type { LocalizedString } from "@/types";

export interface SkillProjectReference {
  title: string;
  url?: string;
  note?: LocalizedString;
}

const github = "https://github.com/muratcanbarcin";
const sinaps: SkillProjectReference = {
  title: "SINAPS · C4ISR",
  url: `${github}/AI-Supported-Lightweight-C4ISR-Prototype-SINAPS`,
};
const accessControl: SkillProjectReference = {
  title: "AI-Assisted Access Control PoC",
  url: `${github}/EnterpriseAgentForSSO`,
};
const metaverse: SkillProjectReference = {
  title: "Metaverse Financial Analytics",
  url: `${github}/metaverse-financial-analytics`,
};
const portfolio: SkillProjectReference = {
  title: "MCB.ai · Portfolio",
  url: `${github}/muratcanbarcin.com`,
};
const gravity: SkillProjectReference = {
  title: "TheGRAVITY · Java",
  url: `${github}/TheGRAVITY`,
};
const privateSource = {
  en: "Private codebase · no public GitHub repository",
  tr: "Özel kod tabanı · herkese açık GitHub deposu yok",
};

/** Verified public sources only. These references do not add project cards or AI repo ingestion. */
export const skillProjects: Readonly<Record<string, readonly SkillProjectReference[]>> = {
  Java: [sinaps, accessControl],
  Python: [accessControl, metaverse],
  JavaScript: [
    {
      title: "Nurederm · n8n JavaScript",
      url: `${github}/nurederm-automation/tree/main/B-n8n/code`,
    },
    portfolio,
  ],
  "C#": [
    {
      title: "The Archery Game · C#",
      url: `${github}/Small-Projects-and-Exercises/blob/main/TheArcheryGame/Program.cs`,
    },
  ],
  "Spring Boot": [accessControl, sinaps],
  "Spring Security": [accessControl, sinaps],
  "Spring Data JPA (Hibernate)": [accessControl, sinaps],
  FastAPI: [accessControl, sinaps],
  "REST APIs": [accessControl, sinaps],
  "Microservices Architecture": [sinaps, accessControl],
  SQL: [accessControl, sinaps],
  PostgreSQL: [sinaps],
  MySQL: [accessControl],
  Redis: [{ title: "Makas", note: privateSource }],
  "Machine Learning (Model Training & Evaluation)": [metaverse, accessControl],
  "LLM Integration": [portfolio, metaverse],
  "LLM Fine-Tuning": [metaverse],
  "Retrieval-Augmented Generation (RAG)": [
    {
      title: "SINAPS · RAG Engine",
      url: `${github}/AI-Supported-Lightweight-C4ISR-Prototype-SINAPS/blob/Main/ai-service/services/rag_engine.py`,
    },
  ],
  "Computer Vision": [{ title: "SleepFlow.AI", note: privateSource }],
  "Data Fusion": [sinaps],
  "System Design": [sinaps, accessControl],
  "Object-Oriented Programming (OOP)": [gravity, accessControl],
  "Data Structures & Algorithms": [
    gravity,
    { title: "Memory Game · Linked Lists", url: `${github}/MemoryGamev1` },
  ],
  "Design Patterns": [accessControl],
  Git: [
    { title: "Portfolio · Git History", url: `${github}/muratcanbarcin.com/commits/main` },
  ],
};

export const skillProjectCopy = {
  hint: {
    en: "Hover or select a skill to explore the related source code.",
    tr: "İlgili kaynak kodları görmek için bir becerinin üzerine gelin veya dokunun.",
  },
  relatedProjects: { en: "Related projects", tr: "İlgili projeler" },
  languages: { en: "Languages", tr: "Yabancı Diller" },
  openProjects: { en: "Explore projects for", tr: "İlgili projeleri göster:" },
  close: { en: "Close", tr: "Kapat" },
} as const;
