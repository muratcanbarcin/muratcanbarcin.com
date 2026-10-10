"use client";

import { useId } from "react";
import type { FormEvent, ReactNode } from "react";
import type { ContactInquiryField } from "@/types";
import { useContactInquiry } from "@/hooks/useContactInquiry";
import { useLocale } from "@/hooks/useLocale";
import { CONTACT_INQUIRY_LIMITS } from "@/lib/contactInquirySchema";
import { actionVariants } from "@/components/ui/action";
import { cn } from "@/lib/utils";

const CONTROL_CLASSES =
  "w-full rounded-md border bg-zinc-950/70 px-3 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-400/30 sm:text-sm";

export function ContactInquiryForm() {
  const { t } = useLocale();
  const form = useContactInquiry();
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  const fieldError = (field: ContactInquiryField) => {
    if (!form.invalidFields.has(field)) return undefined;
    if (field === "name") return t("contact.errors.name");
    if (field === "email") return t("contact.errors.email");
    if (!form.values.message.trim()) return t("contact.errors.messageRequired");
    return t("contact.errors.message", { max: CONTACT_INQUIRY_LIMITS.message });
  };

  const requestError =
    form.status === "rate-limited"
      ? t("contact.errors.rateLimited")
      : form.status === "error"
        ? t("contact.errors.generic")
        : undefined;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.submit();
  };

  return (
    <article className="flex h-full flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{t("contact.formTitle")}</h3>
        <p className="text-sm leading-relaxed text-zinc-400">{t("contact.formBody")}</p>
      </div>

      {form.status === "success" ? (
        <p role="status" className="text-sm leading-relaxed text-emerald-300">
          {t("contact.success", { email: form.confirmedEmail ?? "" })}
        </p>
      ) : (
        <form noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label={t("contact.nameLabel")} htmlFor={nameId} error={fieldError("name")}>
            <input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={CONTACT_INQUIRY_LIMITS.name}
              value={form.values.name}
              onChange={(event) => form.setField("name", event.target.value)}
              placeholder={t("contact.namePlaceholder")}
              aria-invalid={fieldError("name") ? true : undefined}
              className={cn(CONTROL_CLASSES, "h-11", fieldError("name") && "border-red-500/50")}
            />
          </Field>
          <Field label={t("contact.inquiryEmailLabel")} htmlFor={emailId} error={fieldError("email")}>
            <input
              id={emailId}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={CONTACT_INQUIRY_LIMITS.email}
              value={form.values.email}
              onChange={(event) => form.setField("email", event.target.value)}
              placeholder={t("contact.inquiryEmailPlaceholder")}
              aria-invalid={fieldError("email") ? true : undefined}
              className={cn(CONTROL_CLASSES, "h-11", fieldError("email") && "border-red-500/50")}
            />
          </Field>
          <Field label={t("contact.messageLabel")} htmlFor={messageId} error={fieldError("message")} className="sm:col-span-2">
            <textarea
              id={messageId}
              name="message"
              rows={3}
              maxLength={CONTACT_INQUIRY_LIMITS.message}
              value={form.values.message}
              onChange={(event) => form.setField("message", event.target.value)}
              placeholder={t("contact.messagePlaceholder")}
              aria-invalid={fieldError("message") ? true : undefined}
              className={cn(CONTROL_CLASSES, "min-h-24 resize-y py-2.5", fieldError("message") && "border-red-500/50")}
            />
          </Field>
          {requestError && (
            <p role="alert" className="text-sm text-red-300 sm:col-span-2">
              {requestError}
            </p>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={form.status === "submitting"}
              className={cn(actionVariants({ intent: "primary", size: "lg" }), "font-mono text-[13px]")}
            >
              {form.status === "submitting" ? t("contact.submitting") : t("contact.submit")}
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const errorId = `${htmlFor}-error`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
