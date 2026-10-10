"use client";

import { Mail } from "lucide-react";
import type { TranslationKey } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { getResumeRequestHref } from "@/services/resumeRequest";
import { actionVariants, type ActionVariantProps } from "@/components/ui/action";
import { cn } from "@/lib/utils";

interface RequestResumeLinkProps extends ActionVariantProps {
  labelKey?: Extract<TranslationKey, "cta.requestResume" | "cta.requestFullResume">;
  className?: string;
  onClick?: () => void;
}

export function RequestResumeLink({
  labelKey = "cta.requestResume",
  intent,
  size,
  className,
  onClick,
}: RequestResumeLinkProps) {
  const { t } = useLocale();

  return (
    <a
      href={getResumeRequestHref()}
      onClick={onClick}
      className={cn(actionVariants({ intent, size }), className)}
    >
      <Mail aria-hidden="true" />
      {t(labelKey)}
    </a>
  );
}
