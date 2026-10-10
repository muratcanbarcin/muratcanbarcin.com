"use client";

import { CheckCircle2, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { ResumeRequestField } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { useModalDialog } from "@/hooks/useModalDialog";
import { useResumeRequestForm } from "@/hooks/useResumeRequestForm";
import { subscribeToResumeModalOpen } from "@/services/resumeRequest";
import { RESUME_REQUEST_LIMITS } from "@/lib/resumeRequestSchema";
import { actionVariants } from "@/components/ui/action";
import { cn } from "@/lib/utils";

const CONTROL_CLASSES =
  "w-full rounded-md border bg-zinc-900/60 px-3 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-400/30 sm:text-sm";

export function RequestResumeModal() {
  const { t, currentLocale } = useLocale();
  const form = useResumeRequestForm();
  const [isOpen, setIsOpen] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const subtitleId = useId();

  const close = useCallback(() => setIsOpen(false), []);
  const { dialogRef, onBackdropClick } = useModalDialog({ isOpen, onClose: close, initialFocusRef: emailRef });

  const { status, reset } = form;
  const open = useCallback(() => {
    if (status === "success") reset();
    setIsOpen(true);
  }, [status, reset]);

  useEffect(() => subscribeToResumeModalOpen(open), [open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.submit();
  };

  const fieldError = (field: ResumeRequestField): string | undefined => {
    if (!form.invalidFields.has(field)) return undefined;
    if (field === "message") {
      return t("resumeModal.errors.message", { max: RESUME_REQUEST_LIMITS.message.toLocaleString(currentLocale) });
    }
    return t(`resumeModal.errors.${field}`);
  };

  const requestError =
    form.status === "rate-limited"
      ? t("resumeModal.errors.rateLimited")
      : form.status === "error"
        ? t("resumeModal.errors.generic")
        : null;

  const isSubmitting = form.status === "submitting";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
      onClose={close}
      onClick={onBackdropClick}
      className={cn(
        "m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto overscroll-contain rounded-xl border border-zinc-800 bg-zinc-950/95 p-0 text-zinc-300 shadow-2xl shadow-black/60 backdrop-blur-xl",
        "backdrop:bg-zinc-950/70 backdrop:backdrop-blur-sm",
        "scale-[0.98] opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-200 open:scale-100 open:opacity-100 starting:open:scale-[0.98] starting:open:opacity-0 motion-reduce:transition-none",
      )}
    >
      <header className="flex items-start gap-3 border-b border-zinc-800 py-4 pr-2 pl-5 sm:pl-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
          <p className="font-mono text-[11px] text-zinc-500">
            <span aria-hidden="true" className="text-emerald-400/80">
              ${" "}
            </span>
            ./request-resume
          </p>
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-zinc-100">
            {t("resumeModal.title")}
          </h2>
          <p id={subtitleId} className="text-sm leading-relaxed text-zinc-400">
            {t("resumeModal.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={t("resumeModal.close")}
          className={cn(actionVariants({ intent: "ghost", size: "icon" }), "lg:size-11")}
        >
          <X aria-hidden="true" />
        </button>
      </header>

      {form.status === "success" && form.confirmedEmail ? (
        <div role="status" className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-4">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-400" />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-medium text-zinc-100">{t("resumeModal.successTitle")}</p>
              <p className="text-sm leading-relaxed break-words text-zinc-400">
                {t("resumeModal.success", { email: form.confirmedEmail })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            autoFocus
            className={cn(actionVariants({ intent: "primary", size: "lg" }), "w-full sm:w-auto sm:self-end")}
          >
            {t("resumeModal.done")}
          </button>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="flex flex-col gap-5 p-5 sm:p-6">
          <FormField label={t("resumeModal.emailLabel")} error={fieldError("email")} required>
            {(props) => (
              <input
                {...props}
                ref={emailRef}
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={RESUME_REQUEST_LIMITS.email}
                value={form.values.email}
                onChange={(event) => form.setField("email", event.target.value)}
                placeholder={t("resumeModal.emailPlaceholder")}
                className={cn(CONTROL_CLASSES, "h-11", props.className)}
              />
            )}
          </FormField>

          <FormField label={t("resumeModal.companyLabel")} error={fieldError("company")} required>
            {(props) => (
              <input
                {...props}
                type="text"
                name="company"
                autoComplete="organization"
                maxLength={RESUME_REQUEST_LIMITS.company}
                value={form.values.company}
                onChange={(event) => form.setField("company", event.target.value)}
                placeholder={t("resumeModal.companyPlaceholder")}
                className={cn(CONTROL_CLASSES, "h-11", props.className)}
              />
            )}
          </FormField>

          <FormField
            label={t("resumeModal.messageLabel")}
            hint={t("resumeModal.optional")}
            error={fieldError("message")}
          >
            {(props) => (
              <textarea
                {...props}
                name="message"
                rows={3}
                maxLength={RESUME_REQUEST_LIMITS.message}
                value={form.values.message}
                onChange={(event) => form.setField("message", event.target.value)}
                placeholder={t("resumeModal.messagePlaceholder")}
                className={cn(CONTROL_CLASSES, "min-h-24 resize-y py-2.5", props.className)}
              />
            )}
          </FormField>

          {requestError && (
            <p role="alert" className="rounded-md border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-300">
              {requestError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              actionVariants({ intent: "primary", size: "lg" }),
              "w-full font-mono text-[13px] disabled:cursor-wait disabled:opacity-70",
            )}
          >
            {isSubmitting ? t("resumeModal.submitting") : t("resumeModal.submit")}
          </button>
        </form>
      )}
    </dialog>
  );
}

interface FieldControlProps {
  id: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  className: string;
}

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: FieldControlProps) => ReactNode;
}

function FormField({ label, hint, error, required = false, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm text-zinc-200">
        <span>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-emerald-400/80">
              *
            </span>
          )}
        </span>
        {hint && <span className="font-mono text-[11px] text-zinc-500">{hint}</span>}
      </label>
      {children({
        id,
        required: required || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
        className: error ? "border-red-500/60" : "border-zinc-800 hover:border-zinc-700",
      })}
      {error && (
        <p id={errorId} className="font-mono text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
