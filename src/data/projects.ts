import type { Project } from "@/types";

/**
 * `media` and `links` stay empty until real assets exist, so the UI never renders broken
 * links. Drop files into `public/assets/projects/<slug>/` and reference them via `projectAsset()`.
 */
export const projects: readonly Project[] = [
  {
    id: "c4isr-prototype",
    slug: "c4isr-prototype",
    title: "AI-Supported Lightweight C4ISR Prototype",
    subtitle: {
      en: "TEKNOFEST Finalist · Senior Capstone Project",
      tr: "TEKNOFEST Finalisti · Bitirme Projesi",
    },
    topics: [
      { en: "C4ISR", tr: "C4ISR" },
      { en: "Edge AI", tr: "Uçta Yapay Zeka" },
      { en: "Data Fusion", tr: "Veri Füzyonu" },
    ],
    summary: {
      en: "A polyglot microservices C4ISR prototype that fuses multi-source sensor data at the edge for real-time situational awareness and threat detection.",
      tr: "Gerçek zamanlı durumsal farkındalık ve tehdit algılama için çok kaynaklı sensör verilerini uçta birleştiren polyglot mikroservis tabanlı bir C4ISR prototipi.",
    },
    description: {
      en: "Architected a polyglot microservices system for a lightweight C4ISR prototype, using Java and Python services to ensure modularity, scalability, and robust system design. Implemented multi-source data fusion algorithms on Raspberry Pi 5 with AI Cameras, enabling real-time Edge AI processing for immediate situational awareness and threat detection. Developed a decision support interface that visualizes fused sensor data on tactical maps, managing the development lifecycle via Agile methodologies and Jira.",
      tr: "Modülerlik, ölçeklenebilirlik ve güçlü bir sistem tasarımı sağlamak amacıyla Java ve Python servislerini kullanan, hafif bir C4ISR (askeri karar destek sistemi) prototipi için polyglot bir mikroservis sistemi tasarlandı. Anlık durumsal farkındalık ve tehdit algılama sağlamak amacıyla, Raspberry Pi 5 ve Yapay Zeka kameraları üzerinde gerçek zamanlı Edge AI işlemeyi mümkün kılan çok kaynaklı veri füzyonu algoritmaları uygulandı. Geliştirme yaşam döngüsü Agile metodolojiler ve Jira ile yönetilerek, füzyonlanmış sensör verilerini taktik haritalar üzerinde görselleştiren bir karar destek arayüzü geliştirildi.",
    },
    keyMetrics: [
      { en: "Real-time edge AI", tr: "Gerçek zamanlı uçta yapay zeka" },
      { en: "Multi-source data fusion", tr: "Çok kaynaklı veri füzyonu" },
    ],
    techStack: [
      "Java",
      "Python",
      "Microservices",
      "Raspberry Pi 5",
      "Computer Vision",
      "Data Fusion",
      "Jira",
    ],
    architectureFlow: [
      {
        step: 1,
        title: "Edge Camera & Sensors",
        description: {
          en: "Field cameras and sensors on the edge node",
          tr: "Uç düğümdeki saha kameraları ve sensörler",
        },
        technology: "Raspberry Pi 5 · AI Camera",
        inputOutput: "Scene → sensor frames",
      },
      {
        step: 2,
        title: "OpenCV Feature Extraction",
        description: {
          en: "Visual features extracted on the edge",
          tr: "Görsel öznitelikler uçta çıkarılır",
        },
        technology: "OpenCV · Python",
        inputOutput: "Frames → features",
      },
      {
        step: 3,
        title: "Sensor Fusion Engine",
        description: {
          en: "Multi-source features fused into one tactical picture",
          tr: "Çok kaynaklı öznitelikler tek taktik tabloya birleşir",
        },
        technology: "Python · Data Fusion",
        inputOutput: "Features → fused tracks",
      },
      {
        step: 4,
        title: "Tactical Station",
        description: {
          en: "Fused tracks delivered to the operator station",
          tr: "Füzyonlanmış izler operatör istasyonuna iletilir",
        },
        technology: "FastAPI · ZeroMQ",
        inputOutput: "Fused tracks → operator view",
      },
    ],
    media: [],
    links: [],
    status: "completed",
    featured: true,
    award: { en: "TEKNOFEST Finalist", tr: "TEKNOFEST Finalisti" },
    githubUrl: "https://github.com/muratcanbarcin/AI-Supported-Lightweight-C4ISR-Prototype-SINAPS",
    githubSync: {
      enabled: true,
      repo: "muratcanbarcin/AI-Supported-Lightweight-C4ISR-Prototype-SINAPS",
      branch: "Main",
      injectToAI: true,
      syncArchitectureMedia: true,
    },
  },
  {
    id: "sun-group-expense",
    slug: "expense-saas",
    title: "Expense — AI-Powered B2B Expense SaaS",
    subtitle: {
      en: "Sun Group · AI & Backend Engineering",
      tr: "Sun Şirketler Grubu · AI & Backend Mühendisliği",
    },
    topics: [
      { en: "Document Extraction", tr: "Belge Çıkarımı" },
      { en: "Approval Workflow", tr: "Onay Akışı" },
      { en: "SAP Integration", tr: "SAP Entegrasyonu" },
    ],
    summary: {
      en: "An AI document-extraction microservice and Spring Boot approval backend for a B2B expense platform integrated with SAP.",
      tr: "SAP ile entegre bir B2B masraf platformu için yapay zeka tabanlı belge işleme mikroservisi ve Spring Boot onay altyapısı.",
    },
    description: {
      en: 'Engineered an AI microservice (Python, FastAPI) for the "Expense" B2B SaaS that extracts financial data from receipts and invoices, achieving sub-10s processing and a monthly capacity of 1M+ financial documents. Developed the backend architecture and multi-level approval workflows using Java and Spring Boot, completing the system\'s integration with corporate structures such as SAP.',
      tr: '"Expense" isimli B2B SaaS için fiş ve faturalardan finansal verileri çıkaran yapay zeka mikroservisi (Python, FastAPI) geliştirildi; 10 sn altı işlem süresiyle aylık 1 Milyon+ finansal belge kapasitesi sağlandı. Java ve Spring Boot kullanılarak backend mimarisi ile çok aşamalı onay akışları geliştirildi ve sistemin SAP gibi kurumsal yapılarla entegrasyonu tamamlandı.',
    },
    keyMetrics: [
      { en: "Receipt or invoice in under 10 seconds", tr: "Fiş ve fatura 10 saniyenin altında" },
      { en: "Capacity for over 1 million documents a month", tr: "Ayda 1 milyondan fazla fiş ve fatura kapasitesi" },
      { en: "Approvals synced to SAP", tr: "Onaylar SAP ile eşitlenir" },
    ],
    techStack: ["Python", "FastAPI", "Java", "Spring Boot", "SAP"],
    architectureFlow: [
      {
        step: 1,
        title: "AI Extraction Service",
        description: {
          en: "Receipts & invoices → structured data in < 10s",
          tr: "Fiş & fatura → 10 sn altında yapılandırılmış veri",
        },
        technology: "Python · FastAPI",
        inputOutput: "Receipt / invoice → structured expense",
      },
      {
        step: 2,
        title: "Approval Workflow",
        description: {
          en: "Multi-level approval chains",
          tr: "Çok aşamalı onay zincirleri",
        },
        technology: "Java · Spring Boot",
        inputOutput: "Expense → approved expense",
      },
      {
        step: 3,
        title: "ERP Integration",
        description: {
          en: "Approved records synced to SAP",
          tr: "Onaylı kayıtlar SAP ile senkronize",
        },
        technology: "SAP",
        inputOutput: "Approved expense → ERP record",
      },
    ],
    media: [],
    links: [],
    status: "completed",
    featured: true,
    statusBadge: {
      en: "Enterprise B2B SaaS (Sun Group · Proprietary)",
      tr: "Kurumsal B2B SaaS (Sun Şirketler Grubu · Tescilli)",
    },
    githubSync: { enabled: false },
  },
  {
    id: "enterprise-agent-sso",
    slug: "enterprise-agent-sso",
    title: "Enterprise Agent for SSO",
    subtitle: {
      en: "AI-Powered Security System",
      tr: "Yapay Zeka Destekli Güvenlik Sistemi",
    },
    topics: [
      { en: "Risk-Based SSO", tr: "Risk Tabanlı SSO" },
      { en: "Anomaly Detection", tr: "Anomali Tespiti" },
      { en: "Access Control", tr: "Erişim Kontrolü" },
    ],
    summary: {
      en: "Risk-based access control that scores SSO requests with anomaly detection and escalates high-risk access automatically.",
      tr: "SSO isteklerini anomali tespitiyle puanlayan ve yüksek riskli erişimleri otomatik olarak eskale eden risk tabanlı erişim kontrolü.",
    },
    description: {
      en: "Developed a Risk-Based Access Control (RBAC) system using Spring Boot and React, integrating AI to automate secure Single Sign-On approvals. Engineered a Python FastAPI microservice using the Isolation Forest algorithm to detect real-time access anomalies and calculate dynamic risk scores. Integrated n8n workflows to orchestrate automated security escalations for high-risk requests and containerized the architecture using Docker.",
      tr: "Single Sign-On (SSO) onaylarını otomatikleştirmek için yapay zekayı entegre eden, Spring Boot ve React tabanlı bir Risk Tabanlı Erişim Kontrolü (RBAC) sistemi geliştirildi. Gerçek zamanlı erişim anormalliklerini tespit etmek ve dinamik risk skorlarını hesaplamak için Isolation Forest algoritmasını kullanan bir Python FastAPI mikroservisi tasarlandı. Yüksek riskli istekler için otomatik güvenlik eskalasyon süreçlerini yönetmek amacıyla n8n iş akışları entegre edildi ve mimari Docker ile ayağa kaldırıldı.",
    },
    keyMetrics: [
      { en: "Real-time anomaly detection", tr: "Gerçek zamanlı anomali tespiti" },
      { en: "Dynamic risk scoring", tr: "Dinamik risk puanı" },
      { en: "Automated escalation", tr: "Otomatik eskalasyon" },
    ],
    techStack: ["Java", "Spring Boot", "React", "Python", "FastAPI", "Isolation Forest", "MySQL", "n8n", "Docker"],
    architectureFlow: [
      {
        step: 1,
        title: "Client Request",
        description: {
          en: "Access request enters the enterprise agent",
          tr: "Erişim isteği kurumsal ajana girer",
        },
        technology: "React",
        inputOutput: "User → access request",
      },
      {
        step: 2,
        title: "Enterprise Identity Provider",
        description: {
          en: "Identity asserted before risk evaluation",
          tr: "Risk değerlendirmesinden önce kimlik doğrulanır",
        },
        technology: "SSO · Spring Boot",
        inputOutput: "Request → authenticated principal",
      },
      {
        step: 3,
        title: "RBAC Risk Engine",
        description: {
          en: "Isolation Forest scores the access anomaly",
          tr: "Isolation Forest erişim anomalisini puanlar",
        },
        technology: "Python · FastAPI · Isolation Forest",
        inputOutput: "Principal → risk score",
      },
      {
        step: 4,
        title: "Automated SSO Session Escalation",
        description: {
          en: "High-risk sessions escalate without a manual queue",
          tr: "Yüksek riskli oturumlar manuel kuyruk olmadan eskale edilir",
        },
        technology: "n8n · Docker",
        inputOutput: "High-risk score → escalated session",
      },
    ],
    media: [],
    links: [],
    status: "completed",
    featured: false,
    githubUrl: "https://github.com/muratcanbarcin/EnterpriseAgentForSSO",
    githubSync: {
      enabled: true,
      repo: "muratcanbarcin/EnterpriseAgentForSSO",
      branch: "master",
      injectToAI: true,
      syncArchitectureMedia: true,
    },
  },
  {
    id: "sleepflow-ai",
    slug: "sleepflow-ai",
    title: "SleepFlow.AI",
    subtitle: {
      en: "IoT & AI Integrated Sleep Analysis System",
      tr: "IoT & Yapay Zeka Entegreli Uyku Analiz Sistemi",
    },
    topics: [
      { en: "Sleep Analysis", tr: "Uyku Analizi" },
      { en: "Biometric Fusion", tr: "Biyometrik Füzyon" },
      { en: "Edge Vision", tr: "Uçta Görüntü" },
    ],
    summary: {
      en: "Fuses smartwatch biometrics with Raspberry Pi vision data to generate personalized sleep insights with Google Gemini.",
      tr: "Akıllı saat biyometrik verilerini Raspberry Pi görüntü verileriyle birleştirerek Google Gemini ile kişiselleştirilmiş uyku analizleri üretir.",
    },
    description: {
      en: "Built an AI-powered platform merging smartwatch biometrics and Raspberry Pi vision data to generate personalized sleep insights using Google Gemini. Engineered a FastAPI data fusion pipeline synchronizing HealthKit metrics with real-time OpenCV logs via custom matching algorithms. Implemented real-time edge computing for position detection and visualized actionable metrics on a React dashboard.",
      tr: "Akıllı saat biyometrik verilerini ve Raspberry Pi görüntü verilerini birleştirerek Google Gemini entegresi ile kişiselleştirilmiş uyku analizleri üreten yapay zeka destekli bir platform inşa edildi. HealthKit metriklerini, özel eşleştirme algoritmaları aracılığıyla gerçek zamanlı OpenCV loglarıyla senkronize eden bir FastAPI veri füzyonu pipeline'ı tasarlandı. Pozisyon tespiti için gerçek zamanlı edge computing uygulandı ve eyleme dönüştürülebilir metrikler bir React kontrol panelinde görselleştirildi.",
    },
    keyMetrics: [
      { en: "Biometric and vision fusion", tr: "Biyometri ve görüntü füzyonu" },
      { en: "Real-time edge position detection", tr: "Uçta gerçek zamanlı pozisyon tespiti" },
      { en: "LLM-generated insights", tr: "Dil modeli ile üretilen analizler" },
    ],
    techStack: ["Python", "FastAPI", "React", "Google Gemini", "OpenCV", "Swift", "HealthKit", "MySQL", "Raspberry Pi"],
    architectureFlow: [
      {
        step: 1,
        title: "Biometric Capture",
        description: {
          en: "Smartwatch metrics via HealthKit",
          tr: "HealthKit ile akıllı saat metrikleri",
        },
        technology: "Swift · HealthKit",
        inputOutput: "Smartwatch → biometric metrics",
      },
      {
        step: 2,
        title: "Edge Vision",
        description: {
          en: "Real-time sleep position detection",
          tr: "Gerçek zamanlı uyku pozisyonu tespiti",
        },
        technology: "Raspberry Pi · OpenCV",
        inputOutput: "Camera → position logs",
      },
      {
        step: 3,
        title: "Fusion Pipeline",
        description: {
          en: "Biometrics + vision logs on one timeline",
          tr: "Biyometri + görüntü logları tek zaman çizgisinde",
        },
        technology: "Python · FastAPI · MySQL",
        inputOutput: "Metrics + logs → unified timeline",
      },
      {
        step: 4,
        title: "Insight Generation",
        description: {
          en: "Gemini-generated sleep insights",
          tr: "Gemini ile kişisel uyku analizleri",
        },
        technology: "Google Gemini · React",
        inputOutput: "Unified timeline → insights",
      },
    ],
    media: [],
    links: [],
    status: "in-progress",
    featured: true,
    statusBadge: {
      en: "Active Research Asset (Public release upon study completion)",
      tr: "Aktif araştırma varlığı (Çalışma tamamlanınca kamuya açılacak)",
    },
    githubSync: { enabled: false },
  },
  {
    id: "karma",
    slug: "karma",
    title: "Karma",
    subtitle: {
      en: "Sustainable Accommodation Platform · Incubated at T3 Startup Center",
      tr: "Sürdürülebilir Konaklama Platformu · T3 Girişim Merkezi Destekli",
    },
    topics: [
      { en: "Accommodation Sharing", tr: "Konaklama Paylaşımı" },
      { en: "Karma Points", tr: "Karma Puanı" },
      { en: "Booking", tr: "Rezervasyon" },
    ],
    summary: {
      en: "A scalable accommodation platform with booking, secure messaging, and a token-based reward system.",
      tr: "Rezervasyon, güvenli mesajlaşma ve token tabanlı ödül sistemine sahip ölçeklenebilir bir konaklama platformu.",
    },
    description: {
      en: "Architected a scalable accommodation platform using RESTful APIs and a token-based reward system. Engineered core full-stack modules including secure messaging, booking engines, and authentication.",
      tr: "RESTful API'ler ve token tabanlı bir ödül sistemi kullanılarak ölçeklenebilir bir konaklama platformu tasarlandı. Güvenli mesajlaşma, rezervasyon motorları ve kimlik doğrulama dahil olmak üzere temel full-stack modüller geliştirildi.",
    },
    keyMetrics: [{ en: "Token-based rewards", tr: "Token tabanlı ödül" }],
    techStack: ["Node.js", "Express.js", "React", "MySQL", "RESTful APIs"],
    architectureFlow: [
      {
        step: 1,
        title: "Client",
        description: {
          en: "Discovery, booking & messaging UI",
          tr: "Keşif, rezervasyon & mesajlaşma arayüzü",
        },
        technology: "React",
      },
      {
        step: 2,
        title: "REST API",
        description: {
          en: "Auth, bookings, messaging & rewards",
          tr: "Kimlik, rezervasyon, mesajlaşma & ödüller",
        },
        technology: "Node.js · Express.js",
        inputOutput: "HTTP request → domain operation",
      },
      {
        step: 3,
        title: "Persistence",
        description: {
          en: "Relational store for the core domain",
          tr: "Temel alan için ilişkisel veri katmanı",
        },
        technology: "MySQL",
      },
    ],
    media: [],
    links: [],
    status: "completed",
    featured: false,
    githubUrl: "https://github.com/muratcanbarcin/Karma-Web-App",
    githubSync: {
      enabled: true,
      repo: "muratcanbarcin/Karma-Web-App",
      branch: "master",
      injectToAI: true,
      syncArchitectureMedia: true,
    },
  },
];
