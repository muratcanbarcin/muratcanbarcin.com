import { portfolioData } from "@/data/portfolioData";
import { buildMailtoHref } from "@/lib/mailto";

const RESUME_REQUEST_HREF = buildMailtoHref(portfolioData.resumeRequest);

/** Prefilled email intent used everywhere a "resume" action appears; no PDF is ever linked. */
export function getResumeRequestHref(): string {
  return RESUME_REQUEST_HREF;
}
