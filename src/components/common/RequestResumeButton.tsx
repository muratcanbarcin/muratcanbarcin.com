"use client";

import { FileText } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { requestResumeModalOpen } from "@/services/resumeRequest";
import { actionVariants, type ActionVariantProps } from "@/components/ui/action";
import { cn } from "@/lib/utils";

interface RequestResumeButtonProps extends ActionVariantProps {
  className?: string;
  /** Renders the label as a bracketed console action, e.g. `[ Request Resume ]`. */
  bracketed?: boolean;
  onClick?: () => void;
}

export function RequestResumeButton({ intent, size, className, bracketed = false, onClick }: RequestResumeButtonProps) {
  const { t } = useLocale();

  const handleClick = () => {
    onClick?.();
    requestResumeModalOpen();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-haspopup="dialog"
      className={cn(actionVariants({ intent, size }), className)}
    >
      {bracketed ? (
        <>
          <span aria-hidden="true" className="text-zinc-500">
            [
          </span>
          {t("cta.requestResume")}
          <span aria-hidden="true" className="text-zinc-500">
            ]
          </span>
        </>
      ) : (
        <>
          <FileText aria-hidden="true" />
          {t("cta.requestResume")}
        </>
      )}
    </button>
  );
}
