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
    category: "defense-edge",
    summary: {
      en: "A polyglot microservices C4ISR prototype that fuses multi-source sensor data at the edge for real-time situational awareness and threat detection.",
      tr: "Gerçek zamanlı durumsal farkındalık ve tehdit algılama için çok kaynaklı sensör verilerini uçta (edge) birleştiren polyglot mikroservis tabanlı bir C4ISR prototipi.",
    },
    description: {
      en: "Architected a polyglot microservices system for a lightweight C4ISR prototype, using Java and Python services to ensure modularity, scalability, and robust system design. Implemented multi-source data fusion algorithms on Raspberry Pi 5 with AI Cameras, enabling real-time Edge AI processing for immediate situational awareness and threat detection. Developed a decision support interface that visualizes fused sensor data on tactical maps, managing the development lifecycle via Agile methodologies and Jira.",
      tr: "Modülerlik, ölçeklenebilirlik ve güçlü bir sistem tasarımı sağlamak amacıyla Java ve Python servislerini kullanan, hafif bir C4ISR (askeri karar destek sistemi) prototipi için polyglot bir mikroservis sistemi tasarlandı. Anlık durumsal farkındalık ve tehdit algılama sağlamak amacıyla, Raspberry Pi 5 ve Yapay Zeka kameraları üzerinde gerçek zamanlı Edge AI işlemeyi mümkün kılan çok kaynaklı veri füzyonu algoritmaları uygulandı. Geliştirme yaşam döngüsü Agile metodolojiler ve Jira ile yönetilerek, füzyonlanmış sensör verilerini taktik haritalar üzerinde görselleştiren bir karar destek arayüzü geliştirildi.",
    },
    keyMetrics: ["TEKNOFEST Finalist", "Real-time Edge AI", "Multi-source data fusion"],
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
        title: "Edge Sensing",
        description: {
          en: "Raspberry Pi 5 nodes with AI cameras capture the field of view.",
          tr: "Yapay zeka kameralı Raspberry Pi 5 düğümleri görüş alanını yakalar.",
        },
        technology: "Raspberry Pi 5 · AI Camera",
        inputOutput: "Camera stream → detections",
      },
      {
        step: 2,
        title: "Data Fusion",
        description: {
          en: "Multi-source fusion algorithms merge sensor detections into a single situational picture.",
          tr: "Çok kaynaklı füzyon algoritmaları sensör tespitlerini tek bir durumsal tabloda birleştirir.",
        },
        technology: "Python · Computer Vision",
        inputOutput: "Detections → fused tracks",
      },
      {
        step: 3,
        title: "Polyglot Service Layer",
        description: {
          en: "Independent Java and Python microservices keep the system modular and scalable.",
          tr: "Bağımsız Java ve Python mikroservisleri sistemi modüler ve ölçeklenebilir tutar.",
        },
        technology: "Java · Python · Microservices",
      },
      {
        step: 4,
        title: "Decision Support",
        description: {
          en: "Fused sensor data is visualized on tactical maps for operators.",
          tr: "Füzyonlanmış sensör verileri operatörler için taktik haritalarda görselleştirilir.",
        },
        technology: "Tactical Map UI",
        inputOutput: "Fused tracks → operator view",
      },
    ],
    media: [],
    links: [],
    status: "completed",
    featured: true,
  },
  {
    id: "sun-group-expense",
    slug: "expense-saas",
    title: "Expense — AI-Powered B2B Expense SaaS",
    subtitle: {
      en: "Sun Group · AI & Backend Engineering",
      tr: "Sun Şirketler Grubu · AI & Backend Mühendisliği",
    },
    category: "enterprise-saas",
    summary: {
      en: "An AI document-extraction microservice and Spring Boot approval backend for a B2B expense platform integrated with SAP.",
      tr: "SAP ile entegre bir B2B masraf platformu için yapay zeka tabanlı belge işleme mikroservisi ve Spring Boot onay altyapısı.",
    },
    description: {
      en: 'Engineered an AI microservice (Python, FastAPI) for the "Expense" B2B SaaS that extracts financial data from receipts and invoices, achieving sub-10s processing and a monthly capacity of 1M+ financial documents. Developed the backend architecture and multi-level approval workflows using Java and Spring Boot, completing the system\'s integration with corporate structures such as SAP.',
      tr: '"Expense" isimli B2B SaaS için fiş ve faturalardan finansal verileri çıkaran yapay zeka mikroservisi (Python, FastAPI) geliştirildi; 10 sn altı işlem süresiyle aylık 1 Milyon+ finansal belge kapasitesi sağlandı. Java ve Spring Boot kullanılarak backend mimarisi ile çok aşamalı onay akışları geliştirildi ve sistemin SAP gibi kurumsal yapılarla entegrasyonu tamamlandı.',
    },
    keyMetrics: ["< 10s / document", "1M+ documents / month", "SAP integration"],
    techStack: ["Python", "FastAPI", "Java", "Spring Boot", "SAP"],
    architectureFlow: [
      {
        step: 1,
        title: "AI Extraction Service",
        description: {
          en: "Receipts and invoices are parsed into structured financial data.",
          tr: "Fiş ve faturalar yapılandırılmış finansal verilere dönüştürülür.",
        },
        technology: "Python · FastAPI",
        inputOutput: "Receipt / invoice → structured expense",
      },
      {
        step: 2,
        title: "Approval Workflow",
        description: {
          en: "Expenses move through configurable multi-level approval chains.",
          tr: "Masraflar çok aşamalı onay zincirlerinden geçer.",
        },
        technology: "Java · Spring Boot",
        inputOutput: "Expense → approved expense",
      },
      {
        step: 3,
        title: "ERP Integration",
        description: {
          en: "Approved records are synchronized with corporate systems such as SAP.",
          tr: "Onaylanan kayıtlar SAP gibi kurumsal sistemlerle senkronize edilir.",
        },
        technology: "SAP",
        inputOutput: "Approved expense → ERP record",
      },
    ],
    media: [],
    links: [],
    status: "completed",
    featured: true,
  },
  {
    id: "enterprise-agent-sso",
    slug: "enterprise-agent-sso",
    title: "Enterprise Agent for SSO",
    subtitle: {
      en: "AI-Powered Security System",
      tr: "Yapay Zeka Destekli Güvenlik Sistemi",
    },
    category: "applied-ai",
    summary: {
      en: "Risk-based access control that scores SSO requests with anomaly detection and escalates high-risk access automatically.",
      tr: "SSO isteklerini anomali tespitiyle puanlayan ve yüksek riskli erişimleri otomatik olarak eskale eden risk tabanlı erişim kontrolü.",
    },
    description: {
      en: "Developed a Risk-Based Access Control (RBAC) system using Spring Boot and React, integrating AI to automate secure Single Sign-On approvals. Engineered a Python FastAPI microservice using the Isolation Forest algorithm to detect real-time access anomalies and calculate dynamic risk scores. Integrated n8n workflows to orchestrate automated security escalations for high-risk requests and containerized the architecture using Docker.",
      tr: "Single Sign-On (SSO) onaylarını otomatikleştirmek için yapay zekayı entegre eden, Spring Boot ve React tabanlı bir Risk Tabanlı Erişim Kontrolü (RBAC) sistemi geliştirildi. Gerçek zamanlı erişim anormalliklerini tespit etmek ve dinamik risk skorlarını hesaplamak için Isolation Forest algoritmasını kullanan bir Python FastAPI mikroservisi tasarlandı. Yüksek riskli istekler için otomatik güvenlik eskalasyon süreçlerini yönetmek amacıyla n8n iş akışları entegre edildi ve mimari Docker ile ayağa kaldırıldı.",
    },
    keyMetrics: ["Real-time anomaly detection", "Dynamic risk scoring", "Automated escalation"],
    techStack: ["Java", "Spring Boot", "React", "Python", "FastAPI", "Isolation Forest", "MySQL", "n8n", "Docker"],
    architectureFlow: [
      {
        step: 1,
        title: "Access Gateway",
        description: {
          en: "SSO access requests enter the risk-based access control service.",
          tr: "SSO erişim istekleri risk tabanlı erişim kontrol servisine girer.",
        },
        technology: "Spring Boot · React",
        inputOutput: "SSO request → risk evaluation",
      },
      {
        step: 2,
        title: "Risk Engine",
        description: {
          en: "An Isolation Forest model detects anomalies and produces a dynamic risk score.",
          tr: "Isolation Forest modeli anomalileri tespit eder ve dinamik bir risk skoru üretir.",
        },
        technology: "Python · FastAPI · Isolation Forest",
        inputOutput: "Access features → risk score",
      },
      {
        step: 3,
        title: "Escalation Orchestration",
        description: {
          en: "High-risk requests trigger automated security escalation workflows.",
          tr: "Yüksek riskli istekler otomatik güvenlik eskalasyon akışlarını tetikler.",
        },
        technology: "n8n",
        inputOutput: "High-risk score → escalation",
      },
    ],
    media: [],
    links: [],
    status: "completed",
    featured: false,
  },
  {
    id: "sleepflow-ai",
    slug: "sleepflow-ai",
    title: "SleepFlow.AI",
    subtitle: {
      en: "IoT & AI Integrated Sleep Analysis System",
      tr: "IoT & Yapay Zeka Entegreli Uyku Analiz Sistemi",
    },
    category: "iot-fullstack",
    summary: {
      en: "Fuses smartwatch biometrics with Raspberry Pi vision data to generate personalized sleep insights with Google Gemini.",
      tr: "Akıllı saat biyometrik verilerini Raspberry Pi görüntü verileriyle birleştirerek Google Gemini ile kişiselleştirilmiş uyku analizleri üretir.",
    },
    description: {
      en: "Built an AI-powered platform merging smartwatch biometrics and Raspberry Pi vision data to generate personalized sleep insights using Google Gemini. Engineered a FastAPI data fusion pipeline synchronizing HealthKit metrics with real-time OpenCV logs via custom matching algorithms. Implemented real-time edge computing for position detection and visualized actionable metrics on a React dashboard.",
      tr: "Akıllı saat biyometrik verilerini ve Raspberry Pi görüntü verilerini birleştirerek Google Gemini entegresi ile kişiselleştirilmiş uyku analizleri üreten yapay zeka destekli bir platform inşa edildi. HealthKit metriklerini, özel eşleştirme algoritmaları aracılığıyla gerçek zamanlı OpenCV loglarıyla senkronize eden bir FastAPI veri füzyonu pipeline'ı tasarlandı. Pozisyon tespiti için gerçek zamanlı edge computing uygulandı ve eyleme dönüştürülebilir metrikler bir React kontrol panelinde görselleştirildi.",
    },
    keyMetrics: ["Biometric + vision fusion", "Real-time edge position detection", "LLM-generated insights"],
    techStack: ["Python", "FastAPI", "React", "Google Gemini", "OpenCV", "Swift", "HealthKit", "MySQL", "Raspberry Pi"],
    architectureFlow: [
      {
        step: 1,
        title: "Biometric Capture",
        description: {
          en: "Smartwatch health metrics are collected through HealthKit.",
          tr: "Akıllı saat sağlık metrikleri HealthKit üzerinden toplanır.",
        },
        technology: "Swift · HealthKit",
        inputOutput: "Smartwatch → biometric metrics",
      },
      {
        step: 2,
        title: "Edge Vision",
        description: {
          en: "A Raspberry Pi detects sleeping position in real time and emits logs.",
          tr: "Raspberry Pi uyku pozisyonunu gerçek zamanlı tespit eder ve log üretir.",
        },
        technology: "Raspberry Pi · OpenCV",
        inputOutput: "Camera → position logs",
      },
      {
        step: 3,
        title: "Fusion Pipeline",
        description: {
          en: "Custom matching algorithms synchronize biometric metrics with vision logs.",
          tr: "Özel eşleştirme algoritmaları biyometrik metrikleri görüntü loglarıyla senkronize eder.",
        },
        technology: "Python · FastAPI · MySQL",
        inputOutput: "Metrics + logs → unified timeline",
      },
      {
        step: 4,
        title: "Insight Generation",
        description: {
          en: "Google Gemini turns fused data into personalized sleep insights shown on a React dashboard.",
          tr: "Google Gemini birleştirilmiş veriyi React panelinde gösterilen kişisel uyku analizlerine dönüştürür.",
        },
        technology: "Google Gemini · React",
        inputOutput: "Unified timeline → insights",
      },
    ],
    media: [],
    links: [],
    status: "completed",
    featured: true,
  },
  {
    id: "karma",
    slug: "karma",
    title: "Karma",
    subtitle: {
      en: "Sustainable Accommodation Platform · Incubated at T3 Startup Center",
      tr: "Sürdürülebilir Konaklama Platformu · T3 Girişim Merkezi Destekli",
    },
    category: "iot-fullstack",
    summary: {
      en: "A scalable accommodation platform with booking, secure messaging, and a token-based reward system.",
      tr: "Rezervasyon, güvenli mesajlaşma ve token tabanlı ödül sistemine sahip ölçeklenebilir bir konaklama platformu.",
    },
    description: {
      en: "Architected a scalable accommodation platform using RESTful APIs and a token-based reward system. Engineered core full-stack modules including secure messaging, booking engines, and authentication.",
      tr: "RESTful API'ler ve token tabanlı bir ödül sistemi kullanılarak ölçeklenebilir bir konaklama platformu tasarlandı. Güvenli mesajlaşma, rezervasyon motorları ve kimlik doğrulama dahil olmak üzere temel full-stack modüller geliştirildi.",
    },
    keyMetrics: ["Incubated at T3 Startup Center", "Token-based rewards"],
    techStack: ["Node.js", "Express.js", "React", "MySQL", "RESTful APIs"],
    architectureFlow: [
      {
        step: 1,
        title: "Client",
        description: {
          en: "React front end for discovery, booking, and messaging.",
          tr: "Keşif, rezervasyon ve mesajlaşma için React arayüzü.",
        },
        technology: "React",
      },
      {
        step: 2,
        title: "REST API",
        description: {
          en: "Express services handle authentication, bookings, secure messaging, and rewards.",
          tr: "Express servisleri kimlik doğrulama, rezervasyon, güvenli mesajlaşma ve ödülleri yönetir.",
        },
        technology: "Node.js · Express.js",
        inputOutput: "HTTP request → domain operation",
      },
      {
        step: 3,
        title: "Persistence",
        description: {
          en: "Relational storage for users, bookings, messages, and reward balances.",
          tr: "Kullanıcılar, rezervasyonlar, mesajlar ve ödül bakiyeleri için ilişkisel veri katmanı.",
        },
        technology: "MySQL",
      },
    ],
    media: [],
    links: [],
    status: "completed",
    featured: false,
  },
];
