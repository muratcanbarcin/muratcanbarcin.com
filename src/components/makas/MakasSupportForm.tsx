"use client";

import { useId } from "react";
import type { FormEvent, ReactNode } from "react";
import type { MakasSupportField } from "@/types";
import { MAKAS_SUPPORT_SUBJECTS } from "@/types/makasSupport";
import { makasSupportContent } from "@/data/makasSupport";
import { useMakasSupport } from "@/hooks/useMakasSupport";
import { MAKAS_SUPPORT_LIMITS } from "@/lib/makasSupportSchema";
import { actionVariants } from "@/components/ui/action";
import { cn } from "@/lib/utils";

const CONTROL_CLASSES =
  "w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-400/30 disabled:opacity-60 sm:text-sm";

const copy = makasSupportContent;

export function MakasSupportForm() {
  const form = useMakasSupport();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const shopId = useId();
  const subjectId = useId();
  const messageId = useId();

  const fieldError = (field: MakasSupportField) =>
    form.invalidFields.has(field) ? copy.errors[field] : undefined;

  const requestError =
    form.status === "rate-limited" ? copy.errors.rateLimited : form.status === "error" ? copy.errors.generic : undefined;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.submit();
  };

  if (form.status === "success") {
    return (
      <section id="talep" aria-labelledby="makas-form-title" className="scroll-mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 id="makas-form-title" className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
          {copy.formTitle}
        </h2>
        <p role="status" className="mt-3 text-sm leading-relaxed text-emerald-300">
          {copy.success}
        </p>
        <button
          type="button"
          onClick={form.reset}
          className={cn(actionVariants({ intent: "secondary", size: "lg" }), "mt-5 font-mono text-[13px]")}
        >
          {copy.sendAnother}
        </button>
      </section>
    );
  }

  return (
    <section id="talep" aria-labelledby="makas-form-title" className="scroll-mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
      <div className="flex flex-col gap-1.5">
        <h2 id="makas-form-title" className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
          {copy.formTitle}
        </h2>
        <p className="text-sm leading-relaxed text-zinc-400">{copy.formIntro}</p>
      </div>

      <form noValidate onSubmit={submit} className="mt-5 grid gap-4">
        <Field label={copy.labels.name} htmlFor={nameId} error={fieldError("name")} required>
          <input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={MAKAS_SUPPORT_LIMITS.name}
            value={form.values.name}
            onChange={(event) => form.setField("name", event.target.value)}
            placeholder={copy.placeholders.name}
            aria-invalid={fieldError("name") ? true : undefined}
            aria-describedby={fieldError("name") ? `${nameId}-error` : undefined}
            className={cn(CONTROL_CLASSES, "h-11", fieldError("name") && "border-red-500/50")}
          />
        </Field>
        <Field label={copy.labels.email} htmlFor={emailId} error={fieldError("email")} required>
          <input
            id={emailId}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={MAKAS_SUPPORT_LIMITS.email}
            value={form.values.email}
            onChange={(event) => form.setField("email", event.target.value)}
            placeholder={copy.placeholders.email}
            aria-invalid={fieldError("email") ? true : undefined}
            aria-describedby={fieldError("email") ? `${emailId}-error` : undefined}
            className={cn(CONTROL_CLASSES, "h-11", fieldError("email") && "border-red-500/50")}
          />
        </Field>
        <Field label={copy.labels.phone} htmlFor={phoneId} error={fieldError("phone")}>
          <input
            id={phoneId}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={MAKAS_SUPPORT_LIMITS.phone}
            value={form.values.phone}
            onChange={(event) => form.setField("phone", event.target.value)}
            placeholder={copy.placeholders.phone}
            aria-invalid={fieldError("phone") ? true : undefined}
            aria-describedby={fieldError("phone") ? `${phoneId}-error` : undefined}
            className={cn(CONTROL_CLASSES, "h-11", fieldError("phone") && "border-red-500/50")}
          />
        </Field>
        <Field label={copy.labels.shopName} htmlFor={shopId} error={fieldError("shopName")}>
          <input
            id={shopId}
            name="shopName"
            type="text"
            autoComplete="organization"
            maxLength={MAKAS_SUPPORT_LIMITS.shopName}
            value={form.values.shopName}
            onChange={(event) => form.setField("shopName", event.target.value)}
            placeholder={copy.placeholders.shopName}
            aria-invalid={fieldError("shopName") ? true : undefined}
            aria-describedby={fieldError("shopName") ? `${shopId}-error` : undefined}
            className={cn(CONTROL_CLASSES, "h-11", fieldError("shopName") && "border-red-500/50")}
          />
        </Field>
        <Field label={copy.labels.subject} htmlFor={subjectId} error={fieldError("subject")} required>
          <select
            id={subjectId}
            name="subject"
            required
            value={form.values.subject}
            onChange={(event) => form.setField("subject", event.target.value)}
            aria-invalid={fieldError("subject") ? true : undefined}
            aria-describedby={fieldError("subject") ? `${subjectId}-error` : undefined}
            className={cn(CONTROL_CLASSES, "h-11", !form.values.subject && "text-zinc-500", fieldError("subject") && "border-red-500/50")}
          >
            <option value="" disabled>
              {copy.placeholders.subject}
            </option>
            {MAKAS_SUPPORT_SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.labels.message} htmlFor={messageId} error={fieldError("message")} required>
          <textarea
            id={messageId}
            name="message"
            rows={5}
            required
            maxLength={MAKAS_SUPPORT_LIMITS.message}
            value={form.values.message}
            onChange={(event) => form.setField("message", event.target.value)}
            placeholder={copy.placeholders.message}
            aria-invalid={fieldError("message") ? true : undefined}
            aria-describedby={fieldError("message") ? `${messageId}-error` : undefined}
            className={cn(CONTROL_CLASSES, "min-h-32 resize-y py-2.5", fieldError("message") && "border-red-500/50")}
          />
        </Field>
        {requestError && (
          <p role="alert" className="text-sm text-red-300">
            {requestError}
          </p>
        )}
        <button
          type="submit"
          disabled={form.status === "submitting"}
          aria-busy={form.status === "submitting"}
          className={cn(
            actionVariants({ intent: "primary", size: "lg" }),
            "w-full font-mono text-[13px] disabled:opacity-60",
          )}
        >
          {form.status === "submitting" && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950"
            />
          )}
          {form.status === "submitting" ? copy.submitting : copy.submit}
        </button>
      </form>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
        {label}
        {required && <span className="text-zinc-600"> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
