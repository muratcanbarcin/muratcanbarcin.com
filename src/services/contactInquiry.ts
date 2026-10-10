import type { ContactInquiryPayload } from "@/types";

export type ContactInquiryOutcome = "received" | "invalid" | "rate-limited" | "error";

export async function submitContactInquiry(
  payload: ContactInquiryPayload,
  signal?: AbortSignal,
): Promise<ContactInquiryOutcome> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    if (response.ok) return "received";
    if (response.status === 429) return "rate-limited";
    if (response.status === 400) return "invalid";
    return "error";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return "error";
  }
}
