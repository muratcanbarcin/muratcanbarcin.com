import type { MailtoTemplate } from "@/types";

export const resumeRequest: MailtoTemplate = {
  recipient: "muratcanbarcin@gmail.com",
  subject: "Resume Request - Murat Can Barçin",
  bodyLines: [
    "Hi Murat Can,",
    "",
    "I came across your portfolio and would like to review your complete resume for opportunities at [Company Name].",
    "",
    "Best regards,",
  ],
};

export const sourceRepositoryUrl = "https://github.com/muratcanbarcin/muratcanbarcin.com";
