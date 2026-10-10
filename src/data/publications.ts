import type { Publication } from "@/types";

export const publications: readonly Publication[] = [
  {
    id: "metaverse-financial-anomaly-detection",
    title:
      "A Dual-Layer Financial Anomaly Detection and Automated Forensic Reporting Framework for Metaverse Economies",
    authors: ["M. C. Barçin", "F. Dalkılıç"],
    journal: "Journal of Metaverse",
    status: { en: "Under Review", tr: "İnceleme Aşamasında" },
    submissionDate: "2026-07",
    abstract: {
      en: "A framework that pairs a machine-learning detection layer (SMOTE for class imbalance, Isolation Forest and XGBoost for anomaly detection, SHAP for explainability) with a generative reporting layer built on a locally hosted, QLoRA-fine-tuned Llama 3.1 8B model to produce automated forensic reports for Metaverse economies.",
      tr: "Makine öğrenmesi tabanlı bir tespit katmanını (sınıf dengesizliği için SMOTE, anomali tespiti için Isolation Forest ve XGBoost, açıklanabilirlik için SHAP), QLoRA ile ince ayarlanmış ve yerel çalışan Llama 3.1 8B modeli üzerine kurulu üretken bir raporlama katmanıyla birleştirerek Metaverse ekonomileri için otomatik adli raporlar üreten bir çerçeve.",
    },
    keyTech: ["SMOTE", "Isolation Forest", "XGBoost", "SHAP", "QLoRA", "Llama 3.1 8B"],
  },
];
