import type { Publication } from "@/types";

export const publications: readonly Publication[] = [
  {
    id: "metaverse-financial-anomaly-detection",
    title:
      "A Dual-Layer Financial Anomaly Detection and Automated Forensic Reporting Framework for Metaverse Economies",
    authors: [
      { name: "M. C. Barçin" },
      { name: "Feriştah Dalkılıç", academic: true },
    ],
    journal: "Journal of Metaverse",
    status: { en: "Under Review", tr: "İnceleme Aşamasında" },
    submissionDate: "2026-07",
    abstract: {
      en: "A framework that pairs a machine-learning detection layer (SMOTE for class imbalance, Isolation Forest and XGBoost for anomaly detection, SHAP for explainability) with a generative reporting layer built on a locally hosted, QLoRA-fine-tuned Llama 3.1 8B model to produce automated forensic reports for Metaverse economies.",
      tr: "Makine öğrenmesi tabanlı bir tespit katmanını (sınıf dengesizliği için SMOTE, anomali tespiti için Isolation Forest ve XGBoost, açıklanabilirlik için SHAP), QLoRA ile ince ayarlanmış ve yerel çalışan Llama 3.1 8B modeli üzerine kurulu üretken bir raporlama katmanıyla birleştirerek Metaverse ekonomileri için otomatik adli raporlar üreten bir çerçeve.",
    },
    keyTech: ["SMOTE", "Isolation Forest", "XGBoost", "SHAP", "QLoRA", "Llama 3.1 8B"],
  },
  {
    id: "c4isr-edge-fusion",
    title: "A Polyglot Microservices Architecture for Real-Time Edge Data Fusion in a Lightweight C4ISR Prototype",
    authors: [
      { name: "M. C. Barçin" },
      { name: "Prof. Dr. Semih Utku", academic: true },
      { name: "Emirhan Güler" },
      { name: "Sarp Deniz Topaloğlu" },
    ],
    journal: "Working manuscript",
    status: { en: "In Preparation", tr: "Hazırlık Aşamasında" },
    abstract: {
      en: "Manuscript in preparation on the TEKNOFEST-finalist lightweight C4ISR prototype. It describes a polyglot Java and Python microservice architecture that fuses multi-source sensor detections on Raspberry Pi 5 nodes and presents the fused tracks on a tactical decision-support map.",
      tr: "TEKNOFEST finalisti hafif C4ISR prototipine ilişkin, hazırlık aşamasındaki çalışma. Raspberry Pi 5 düğümlerinde çok kaynaklı sensör tespitlerini birleştiren ve füzyonlanmış izleri taktik karar destek haritasında sunan polyglot Java ve Python mikroservis mimarisini anlatır.",
    },
    keyTech: ["Java", "Python", "Microservices", "Raspberry Pi 5", "Computer Vision", "Data Fusion"],
  },
];
