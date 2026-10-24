"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { SocialLink, SocialPlatform } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useLocale } from "@/hooks/useLocale";
import { ContactInquiryForm } from "./ContactInquiryForm";
import { GitHubIcon, LinkedInIcon } from "@/components/common/BrandIcons";
import { RequestResumeButton } from "@/components/common/RequestResumeButton";
import { SectionHeader } from "@/components/common/SectionHeader";
import { actionVariants } from "@/components/ui/action";
import { cn } from "@/lib/utils";

const { profile, contact } = portfolioData;

type ProfilePlatform = Exclude<SocialPlatform, "email">;

const PROFILE_META: Record<ProfilePlatform, { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  linkedin: { label: "LinkedIn", Icon: LinkedInIcon },
  github: { label: "GitHub", Icon: GitHubIcon },
};

const PROFILE_ORDER: readonly ProfilePlatform[] = ["linkedin", "github"];

type ProfileLink = SocialLink & { platform: ProfilePlatform };

const PROFILE_LINKS: readonly ProfileLink[] = PROFILE_ORDER.flatMap((platform) => {
  const link = profile.socials.find((social) => social.platform === platform);
  return link ? [{ ...link, platform }] : [];
});

const CARD_CLASSES = "flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6";

export function ContactSection() {
  const { t } = useLocale();
  const clipboard = useCopyToClipboard();

  const copyLabel =
    clipboard.status === "copied"
      ? t("contact.copied")
      : clipboard.status === "failed"
        ? t("contact.copyFailed")
        : t("contact.copyEmail");

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-24">
      <SectionHeader
        index="07"
        command="./contact --init"
        title={t("sections.contact")}
        titleId="contact-title"
      />

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <ContactInquiryForm />

        <div className="flex flex-col gap-4">
          <article className={cn(CARD_CLASSES, "gap-4")}>
            <h3 className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{t("contact.emailLabel")}</h3>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-base break-all text-zinc-100 sm:text-lg">{contact.email}</p>
              <button
                type="button"
                onClick={() => void clipboard.copy(contact.email)}
                className={cn(
                  actionVariants({ intent: "secondary", size: "md" }),
                  "w-full font-mono text-xs sm:w-auto",
                  clipboard.status === "copied" && "border-emerald-500/40 text-emerald-300",
                )}
              >
                {clipboard.status === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                <span aria-live="polite">{copyLabel}</span>
              </button>
            </div>
          </article>

          <article
            className={cn(
              CARD_CLASSES,
              "justify-between gap-4 border-emerald-500/20 bg-linear-to-b from-emerald-500/[0.06] to-zinc-900/30 sm:flex-row sm:items-center",
            )}
          >
            <div className="flex flex-col gap-1.5">
              <h3 className="font-mono text-[11px] tracking-wider text-emerald-300/90 uppercase">
                {t("contact.resumeTitle")}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">{t("contact.resumeBody")}</p>
            </div>
            <RequestResumeButton intent="primary" size="lg" bracketed className="w-full shrink-0 font-mono text-[13px] sm:w-auto" />
          </article>

          <ul className="grid flex-1 gap-4 sm:grid-cols-2">
            {PROFILE_LINKS.map((link) => (
              <li key={link.platform} className="h-full min-h-0">
                <ProfileCard link={link} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ProfileCard({ link }: { link: ProfileLink }) {
  const { label, Icon } = PROFILE_META[link.platform];

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        CARD_CLASSES,
        "group h-full gap-5 outline-none transition-colors hover:border-zinc-700 hover:bg-zinc-900/60 focus-visible:ring-2 focus-visible:ring-zinc-400/60",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors group-hover:border-emerald-500/30 group-hover:text-emerald-300">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 text-zinc-600 transition-colors group-hover:text-zinc-200"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-base font-semibold tracking-tight text-zinc-100">{label}</p>
        <p className="font-mono text-xs text-zinc-500">@{link.handle}</p>
      </div>
    </a>
  );
}
