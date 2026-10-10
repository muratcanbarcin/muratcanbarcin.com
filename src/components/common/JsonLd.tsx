import { buildStructuredData, serializeJsonLd } from "@/lib/structuredData";

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildStructuredData()) }}
    />
  );
}
