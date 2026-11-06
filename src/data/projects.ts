import type { Project } from "@/types";

/** Public repository bindings are explicitly allowlisted; private projects use local context. */
export const projects: readonly Project[] = [
  {
    id: "c4isr-prototype",
    slug: "c4isr-prototype",
    title: "SINAPS — AI-Supported Lightweight C4ISR Prototype",
    subtitle: {
      en: "TEKNOFEST 2026 · 5th Place · Senior Capstone",
      tr: "TEKNOFEST 2026 · 5’incilik · Bitirme Projesi"
    },
    topics: [
      {
        en: "C4ISR",
        tr: "C4ISR"
      },
      {
        en: "Edge AI",
        tr: "Uçta Yapay Zeka"
      },
      {
        en: "Data Fusion",
        tr: "Veri Füzyonu"
      }
    ],
    summary: {
      en: "Combines live sensor and simulated telemetry with AI-assisted tactical decision support on a geospatial command dashboard.",
      tr: "Canlı sensör ve simülasyon telemetrisini, coğrafi komuta panelinde AI destekli taktik karar desteğiyle birleştirir."
    },
    description: {
      en: "Designed modular Java/Spring Boot and Python microservices for real-time telemetry and AI-assisted tactical decision support. MQTT carries drone and simulator events; HTTP ingests wearable biometrics and location. PostgreSQL/PostGIS stores geospatial assets, while a FastAPI AI service and React/Leaflet dashboard support analysis and tactical maps. Physical and simulated tracks remain distinguishable. The team placed fifth at TEKNOFEST 2026.",
      tr: "Gerçek zamanlı telemetri ve AI destekli taktik karar desteği için Java/Spring Boot ve Python mikroservislerinden oluşan modüler mimari tasarlandı. Drone ve simülasyon olayları MQTT, giyilebilir cihaz biyometrisi ve konum verileri HTTP ile alınır. PostgreSQL/PostGIS coğrafi varlıkları saklar; FastAPI AI servisi ve React/Leaflet paneli analiz ile taktik haritaları destekler. Fiziksel ve simüle izler ayrı tutulur. Ekip TEKNOFEST 2026’da beşinci oldu."
    },
    keyMetrics: [
      {
        en: "TEKNOFEST 2026 · 5th place",
        tr: "TEKNOFEST 2026 · 5’incilik"
      },
      {
        en: "Live + simulated telemetry fusion",
        tr: "Canlı + simülasyon telemetrisi füzyonu"
      }
    ],
    techStack: [
      "Java",
      "Spring Boot",
      "Python",
      "FastAPI",
      "PostgreSQL/PostGIS",
      "MQTT",
      "React",
      "TypeScript",
      "Leaflet",
      "Edge AI",
      "Docker Compose"
    ],
    architectureFlow: [
      {
        step: 1,
        title: "Sensor & Simulation Sources",
        description: {
          en: "Drone telemetry, wearable biometrics and simulated tracks",
          tr: "Drone telemetrisi, giyilebilir biyometri ve simüle izler"
        },
        technology: "Raspberry Pi · Python · MQTT / HTTP"
      },
      {
        step: 2,
        title: "Telemetry Ingestion",
        description: {
          en: "Normalize live and simulated events into a common asset model",
          tr: "Canlı ve simüle olayları ortak varlık modeline dönüştürür"
        },
        technology: "Java · Spring Boot · MQTT"
      },
      {
        step: 3,
        title: "Geospatial Data & Analysis",
        description: {
          en: "Persist geometry and request AI-assisted assessments",
          tr: "Coğrafi veriyi saklar ve AI destekli değerlendirme ister"
        },
        technology: "PostgreSQL/PostGIS · Python · FastAPI"
      },
      {
        step: 4,
        title: "Command Dashboard",
        description: {
          en: "Visualize tracks and decision support on tactical maps",
          tr: "İzleri ve karar desteğini taktik haritalarda gösterir"
        },
        technology: "React · TypeScript · Leaflet"
      }
    ],
    media: [],
    links: [],
    status: "completed",
    featured: true,
    award: {
      en: "TEKNOFEST 2026 · 5th Place",
      tr: "TEKNOFEST 2026 · 5’incilik"
    },
    githubUrl: "https://github.com/muratcanbarcin/AI-Supported-Lightweight-C4ISR-Prototype-SINAPS",
    githubSync: {
      enabled: true,
      repo: "muratcanbarcin/AI-Supported-Lightweight-C4ISR-Prototype-SINAPS",
      branch: "Main",
      injectToAI: true,
      syncArchitectureMedia: true
    }
  },
  {
    id: "sun-group-expense",
    slug: "expense-saas",
    title: "Expense — AI-Powered B2B Expense SaaS",
    subtitle: {
      en: "Sun Group · AI & Backend Engineering",
      tr: "Sun Şirketler Grubu · AI & Backend Mühendisliği"
    },
    topics: [
      {
        en: "Document Extraction",
        tr: "Belge Çıkarımı"
      },
      {
        en: "Approval Workflow",
        tr: "Onay Akışı"
      },
      {
        en: "Integration Readiness",
        tr: "Entegrasyona Hazırlık"
      }
    ],
    summary: {
      en: "AI receipt and invoice extraction plus multi-level Spring Boot approval workflows, prepared for external systems such as SAP.",
      tr: "Fiş ve faturalardan AI ile veri çıkarımı ve çok seviyeli Spring Boot onay akışları; SAP gibi harici sistemlere entegrasyona hazırlandı."
    },
    description: {
      en: "Developed the Expense B2B SaaS AI service in Python/FastAPI, averaging under 10 seconds per receipt or invoice in tests with an estimated capacity of 1M+ documents per month. Built Java/Spring Boot backend architecture and multi-level approval workflows, preparing the platform for external integration such as SAP. These figures describe test results and estimated capacity, not measured production throughput.",
      tr: "Expense B2B SaaS için Python/FastAPI AI servisi geliştirildi; testlerde fiş veya fatura başına ortalama 10 saniyenin altında işlem süresi ve aylık 1M+ belge kapasitesi tahmini elde edildi. Java/Spring Boot backend mimarisi ve çok seviyeli onay akışları geliştirilerek platform SAP gibi harici sistemlerle entegrasyona hazırlandı. Bu rakamlar üretim trafiğini değil, test sonuçlarını ve tahmini kapasiteyi ifade eder."
    },
    keyMetrics: [
      {
        en: "<10s average per document in tests",
        tr: "Testlerde belge başına ortalama <10 sn"
      },
      {
        en: "Estimated 1M+ documents / month",
        tr: "Tahmini aylık 1M+ belge kapasitesi"
      },
      {
        en: "Prepared for SAP integration",
        tr: "SAP entegrasyonuna hazırlandı"
      }
    ],
    techStack: [
      "Python",
      "FastAPI",
      "Java",
      "Spring Boot"
    ],
    architectureFlow: [
      {
        step: 1,
        title: "AI Extraction Service",
        description: {
          en: "Receipts and invoices become structured data; test average <10s",
          tr: "Fiş ve faturadan yapılandırılmış veri; test ortalaması <10 sn"
        },
        technology: "Python · FastAPI",
        inputOutput: "Receipt / invoice → structured expense"
      },
      {
        step: 2,
        title: "Approval Workflow",
        description: {
          en: "Multi-level approval chains",
          tr: "Çok aşamalı onay zincirleri"
        },
        technology: "Java · Spring Boot",
        inputOutput: "Expense → approved expense"
      },
      {
        step: 3,
        title: "External Integration Readiness",
        description: {
          en: "Approval backend prepared for external systems such as SAP",
          tr: "Onay altyapısı SAP gibi harici sistemlere entegrasyona hazırlandı"
        },
        technology: "Integration boundary"
      }
    ],
    media: [],
    links: [],
    status: "completed",
    featured: true,
    statusBadge: {
      en: "Enterprise B2B SaaS (Sun Group · Proprietary)",
      tr: "Kurumsal B2B SaaS (Sun Şirketler Grubu · Tescilli)"
    },
    githubSync: {
      enabled: false
    }
  },
  {
    id: "enterprise-agent-sso",
    slug: "enterprise-agent-sso",
    title: "AI-Assisted Access Control & Anomaly Detection (PoC)",
    subtitle: {
      en: "Policy Rules + Isolation Forest · Local Demo",
      tr: "Politika Kuralları + Isolation Forest · Yerel Demo"
    },
    topics: [
      {
        en: "Risk Assessment",
        tr: "Risk Değerlendirmesi"
      },
      {
        en: "Anomaly Detection",
        tr: "Anomali Tespiti"
      },
      {
        en: "Access Control",
        tr: "Erişim Kontrolü"
      }
    ],
    summary: {
      en: "A local-account proof of concept combining policy rules and Isolation Forest to approve low-risk requests or record pending review.",
      tr: "Politika kuralları ve Isolation Forest ile düşük riskli talepleri onaylayan veya inceleme bekliyor olarak kaydeden, yerel hesap tabanlı kavram kanıtı."
    },
    description: {
      en: "Built Spring Boot and FastAPI services combining department/time policies with Isolation Forest trained on synthetic access history. React uses local sign-in, session cookies and CSRF tokens. Requests and audit entries commit atomically to MySQL; high-risk or unavailable assessments remain pending review with optional n8n alerts after commit. SSO, OAuth, identity-provider integration, resource provisioning and reviewer approval are outside the implemented scope.",
      tr: "Departman/saat politikalarını sentetik erişim geçmişiyle eğitilmiş Isolation Forest ile birleştiren Spring Boot ve FastAPI servisleri geliştirildi. React yerel giriş, oturum çerezleri ve CSRF token kullanır. Talep ve denetim kaydı MySQL’e atomik yazılır; yüksek riskte veya değerlendirme yapılamadığında inceleme beklenir, commit sonrası isteğe bağlı n8n bildirimi gönderilir. SSO, OAuth, kimlik sağlayıcısı entegrasyonu, kaynak yetkilendirme ve inceleyen onayı uygulanmış kapsamın dışındadır."
    },
    keyMetrics: [
      {
        en: "Policy + model risk scoring",
        tr: "Politika + model risk skoru"
      },
      {
        en: "Atomic request and audit writes",
        tr: "Atomik talep ve denetim kaydı"
      },
      {
        en: "Pending review on assessment failure",
        tr: "Değerlendirme hatasında inceleme bekler"
      }
    ],
    techStack: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "React",
      "Python",
      "FastAPI",
      "Isolation Forest",
      "MySQL",
      "n8n",
      "Docker"
    ],
    architectureFlow: [
      {
        step: 1,
        title: "Local Authentication",
        description: {
          en: "Local accounts, session cookies and CSRF-protected requests",
          tr: "Yerel hesaplar, oturum çerezleri ve CSRF korumalı talepler"
        },
        technology: "React · Spring Security"
      },
      {
        step: 2,
        title: "Risk Assessment",
        description: {
          en: "Department/time rules and synthetic-history anomaly detection",
          tr: "Departman/saat kuralları ve sentetik geçmişte anomali tespiti"
        },
        technology: "FastAPI · Isolation Forest"
      },
      {
        step: 3,
        title: "Decision & Audit",
        description: {
          en: "Atomically store approval or pending review and its reason",
          tr: "Onay veya bekleyen incelemeyi gerekçesiyle atomik kaydeder"
        },
        technology: "Spring Boot · MySQL"
      },
      {
        step: 4,
        title: "Optional Notification",
        description: {
          en: "Attempt a pending-review webhook after commit",
          tr: "Commit sonrası bekleyen inceleme için webhook bildirimi dener"
        },
        technology: "n8n"
      }
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
      syncArchitectureMedia: true
    }
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
      en: "Sustainable Accommodation Sharing · Academic Prototype",
      tr: "Sürdürülebilir Konaklama Paylaşımı · Akademik Prototip"
    },
    topics: [
      {
        en: "Accommodation Sharing",
        tr: "Konaklama Paylaşımı"
      },
      {
        en: "Karma Points",
        tr: "Karma Puanı"
      },
      {
        en: "Booking",
        tr: "Rezervasyon"
      }
    ],
    summary: {
      en: "A React/Express accommodation-sharing prototype with listings, bookings and a relational karma-points schema.",
      tr: "İlan, rezervasyon ve ilişkisel karma puanı şeması içeren React/Express konaklama paylaşım prototipi."
    },
    description: {
      en: "Built an academic accommodation-sharing application with React/Vite, Express and MySQL. The repository includes listing and booking routes, local authentication and an ER model for messaging, reviews and point transactions. Karma points represent community exchange, not a blockchain token. Full token integration and other enhancements remain future work; the prototype is not presented as production hardened.",
      tr: "React/Vite, Express ve MySQL ile akademik konaklama paylaşım uygulaması geliştirildi. Depoda ilan ve rezervasyon uç noktaları, yerel kimlik doğrulama ile mesajlaşma, değerlendirme ve puan işlemlerine ilişkin ER modeli bulunur. Karma puanları topluluk içi değişimi temsil eder; blokzincir token’ı değildir. Tam token entegrasyonu ve diğer geliştirmeler gelecek çalışma kapsamındadır; prototip üretim güvenliği tamamlanmış olarak sunulmaz."
    },
    keyMetrics: [
      {
        en: "Relational karma-points design",
        tr: "İlişkisel karma puanı tasarımı"
      }
    ],
    techStack: [
      "Node.js",
      "Express.js",
      "React",
      "Vite",
      "MySQL",
      "RESTful APIs"
    ],
    architectureFlow: [
      {
        step: 1,
        title: "Client",
        description: {
          en: "Accommodation discovery and booking interface",
          tr: "Konaklama keşfi ve rezervasyon arayüzü"
        },
        technology: "React"
      },
      {
        step: 2,
        title: "REST API",
        description: {
          en: "Local authentication, listings and booking routes",
          tr: "Yerel kimlik doğrulama, ilan ve rezervasyon uç noktaları"
        },
        technology: "Node.js · Express.js",
        inputOutput: "HTTP request → domain operation"
      },
      {
        step: 3,
        title: "Persistence",
        description: {
          en: "Relational store for the core domain",
          tr: "Temel alan için ilişkisel veri katmanı"
        },
        technology: "MySQL"
      }
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
      syncArchitectureMedia: true
    }
  },
  {
    id: "metaverse-financial-analytics",
    slug: "metaverse-financial-analytics",
    title: "Metaverse Financial Analytics",
    subtitle: {
      en: "Research Prototype · Journal of Metaverse Under Review",
      tr: "Araştırma Prototipi · Journal of Metaverse İnceleme Aşamasında"
    },
    topics: [
      {
        en: "Financial Anomaly Detection",
        tr: "Finansal Anomali Tespiti"
      },
      {
        en: "Explainable AI",
        tr: "Açıklanabilir AI"
      },
      {
        en: "Local GenAI",
        tr: "Yerel GenAI"
      }
    ],
    summary: {
      en: "Combines PaySim and Ethereum fraud analysis, SHAP explanations and local Llama forensic reporting.",
      tr: "PaySim ve Ethereum dolandırıcılık analizini, SHAP açıklamalarını ve yerel Llama adli raporlamayı birleştirir."
    },
    description: {
      en: "A research pipeline comparing Isolation Forest with SMOTE + XGBoost on Web2 PaySim and Web3 Ethereum data. Training-fold-only SMOTE and held-out evaluation support leakage-aware experiments. SHAP explains predictions; local Llama 3.1 8B, QLoRA adapters and a rule-based fallback support forensic reporting in a Streamlit dashboard. The associated manuscript is under review; repository example metrics are not production guarantees.",
      tr: "Web2 PaySim ve Web3 Ethereum verisinde Isolation Forest ile SMOTE + XGBoost’u karşılaştıran araştırma hattı. SMOTE yalnızca eğitim katında uygulanır; ayrılmış test kümesiyle veri sızıntısı gözetilerek değerlendirme yapılır. SHAP tahminleri açıklar; yerel Llama 3.1 8B, QLoRA adaptörleri ve kural tabanlı yedek yöntem Streamlit panelinde adli raporlamayı destekler. İlgili makale inceleme aşamasındadır; depodaki örnek metrikler üretim garantisi değildir."
    },
    keyMetrics: [
      {
        en: "Web2 + Web3 analysis",
        tr: "Web2 + Web3 analizi"
      },
      {
        en: "Under review; not yet published",
        tr: "İnceleme aşamasında; henüz yayımlanmadı"
      }
    ],
    techStack: [
      "Python",
      "SMOTE",
      "Isolation Forest",
      "XGBoost",
      "SHAP",
      "QLoRA",
      "Llama 3.1 8B",
      "Ollama",
      "Streamlit"
    ],
    architectureFlow: [
      {
        step: 1,
        title: "Data Preparation",
        description: {
          en: "Prepare PaySim and Ethereum data with leakage-aware features",
          tr: "PaySim ve Ethereum verisini sızıntı gözeten özelliklerle hazırlar"
        },
        technology: "Python"
      },
      {
        step: 2,
        title: "Detection & Explanation",
        description: {
          en: "Compare baseline and supervised models; explain scores",
          tr: "Temel ve denetimli modelleri karşılaştırır; skorları açıklar"
        },
        technology: "Isolation Forest · XGBoost · SHAP"
      },
      {
        step: 3,
        title: "Forensic Reporting",
        description: {
          en: "Local generation with rule-based fallback and dashboard exports",
          tr: "Kural tabanlı yedek yöntemle yerel üretim ve panel çıktıları"
        },
        technology: "Llama 3.1 · QLoRA · Streamlit"
      }
    ],
    media: [],
    links: [],
    status: "under-review",
    featured: false,
    githubUrl: "https://github.com/muratcanbarcin/metaverse-financial-analytics",
    githubSync: {
      enabled: true,
      repo: "muratcanbarcin/metaverse-financial-analytics",
      branch: "master",
      injectToAI: true,
      syncArchitectureMedia: true
    }
  },
];
