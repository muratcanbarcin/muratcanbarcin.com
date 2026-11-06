import type { PromptChip } from "@/types";

/** Starter pool. The visible row is a fixed subset — it does not rotate on a timer. */
export const consolePrompts: readonly PromptChip[] = [
  {
    id: "enterprise-sap",
    kind: "query",
    label: { en: "Spring Boot & Integration Readiness", tr: "Spring Boot & Entegrasyona Hazırlık" },
    prompt: {
      en: "How did Murat Can architect the Spring Boot approval workflows and prepare for external integration such as SAP for the Expense SaaS at Sun Group?",
      tr: "Murat Can, Sun Group'taki Expense SaaS için Spring Boot onay akışlarını nasıl geliştirdi ve SAP gibi harici sistemlere entegrasyona nasıl hazırlık yaptı?",
    },
  },
  {
    id: "c4isr-polyglot",
    kind: "query",
    label: { en: "TEKNOFEST C4ISR Polyglot Pipeline", tr: "TEKNOFEST C4ISR Polyglot Hattı" },
    prompt: {
      en: "Walk me through the polyglot Java/Python pipeline of the TEKNOFEST C4ISR prototype, from edge sensing to decision support.",
      tr: "TEKNOFEST C4ISR prototipindeki Java/Python polyglot hattını, uç algılamadan karar desteğine kadar anlat.",
    },
  },
  {
    id: "metaverse-qlora",
    kind: "query",
    label: { en: "Metaverse Anomaly Detection & QLoRA Research", tr: "Metaverse Anomali Tespiti & QLoRA Araştırması" },
    prompt: {
      en: "Summarize the dual-layer Metaverse financial anomaly detection research and its QLoRA fine-tuned Llama 3.1 8B reporting layer.",
      tr: "Çift katmanlı Metaverse finansal anomali tespiti araştırmasını ve QLoRA ile ince ayarlanmış Llama 3.1 8B raporlama katmanını özetle.",
    },
  },
  {
    id: "turkcell-sardis",
    kind: "query",
    label: { en: "Turkcell Subscription & Test Automation APIs", tr: "Turkcell Abonelik & Test Otomasyon API'leri" },
    prompt: {
      en: "What did Murat Can build in Turkcell's Sardis team across subscription lifecycle, payment APIs, and test automation?",
      tr: "Murat Can, Turkcell Sardis ekibinde abonelik yaşam döngüsü, ödeme API'leri ve test otomasyonu tarafında neler geliştirdi?",
    },
  },
  {
    id: "backend-core",
    kind: "query",
    label: { en: "Core Backend & Microservice Stack", tr: "Temel Backend & Mikroservis Yığını" },
    prompt: {
      en: "What is Murat Can's core backend stack, and how does he design resilient microservices?",
      tr: "Murat Can'ın temel backend yığını nedir ve dayanıklı mikroservisleri nasıl tasarlar?",
    },
  },
  {
    id: "sso-risk-engine",
    kind: "query",
    label: { en: "AI-Assisted Access Control PoC", tr: "AI Destekli Erişim Kontrolü PoC" },
    prompt: {
      en: "Explain the access-control PoC: policy rules, Isolation Forest, audit logging and pending-review notifications. What remains outside its scope?",
      tr: "Erişim kontrolü PoC projesini anlat: politika kuralları, Isolation Forest, denetim kayıtları ve inceleme bildirimleri. Hangi özellikler kapsam dışında?",
    },
  },
  {
    id: "expense-ai-throughput",
    kind: "query",
    label: { en: "AI Extraction: Tests & Estimated Capacity", tr: "AI Belge Çıkarımı: Testler & Tahmini Kapasite" },
    prompt: {
      en: "What were the document-extraction test results, and how does the estimated 1M+ documents/month capacity differ from measured production throughput?",
      tr: "Belge çıkarımı test sonuçları nelerdi; aylık tahmini 1M+ belge kapasitesi ile ölçülmüş üretim trafiği arasındaki fark nedir?",
    },
  },
  {
    id: "availability",
    kind: "query",
    label: { en: "Availability & Relocation", tr: "Uygunluk & Relokasyon" },
    prompt: {
      en: "Where is Murat Can based, and is he open to relocation?",
      tr: "Murat Can nerede yaşıyor; taşınmaya açık mı?",
    },
  },
  {
    id: "cmd-help",
    kind: "command",
    label: { en: "Run /help for shell commands", tr: "Komutlar için /help çalıştır" },
    command: "/help",
  },
  {
    id: "cmd-projects",
    kind: "command",
    label: { en: "/projects — featured systems", tr: "/projects — öne çıkan sistemler" },
    command: "/projects",
  },
  {
    id: "cmd-exp",
    kind: "command",
    label: { en: "/exp — career timeline", tr: "/exp — kariyer zaman çizelgesi" },
    command: "/exp",
  },
  {
    id: "cmd-skills",
    kind: "command",
    label: { en: "/skills — core stack", tr: "/skills — temel yığın" },
    command: "/skills",
  },
  {
    id: "cmd-whoami",
    kind: "command",
    label: { en: "/whoami — profile & status", tr: "/whoami — profil & durum" },
    command: "/whoami",
  },
  {
    id: "cmd-resume",
    kind: "command",
    label: { en: "/resume — request the CV", tr: "/resume — özgeçmiş talep et" },
    command: "/resume",
  },
];

const SUGGESTION_IDS = ["enterprise-sap", "c4isr-polyglot", "metaverse-qlora", "cmd-help"] as const;

/** Visible starter row. Stable on purpose — a rotating set reads as noise, not as suggestions. */
export const consoleSuggestions: readonly PromptChip[] = SUGGESTION_IDS.flatMap((id) => {
  const chip = consolePrompts.find((item) => item.id === id);
  return chip ? [chip] : [];
});
