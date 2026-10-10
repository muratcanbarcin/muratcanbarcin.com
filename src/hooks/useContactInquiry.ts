"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ContactInquiryField, ContactInquiryPayload } from "@/types";
import { collectInvalidContactFields, contactInquirySchema } from "@/lib/contactInquirySchema";
import { submitContactInquiry } from "@/services/contactInquiry";

export type ContactInquiryStatus = "idle" | "submitting" | "success" | "rate-limited" | "error";

const EMPTY_VALUES: ContactInquiryPayload = { name: "", email: "", message: "" };

export interface ContactInquiryFormState {
  values: ContactInquiryPayload;
  invalidFields: ReadonlySet<ContactInquiryField>;
  status: ContactInquiryStatus;
  confirmedEmail: string | null;
  setField: (field: ContactInquiryField, value: string) => void;
  submit: () => Promise<void>;
}

export function useContactInquiry(): ContactInquiryFormState {
  const [values, setValues] = useState<ContactInquiryPayload>(EMPTY_VALUES);
  const [invalidFields, setInvalidFields] = useState<ReadonlySet<ContactInquiryField>>(new Set());
  const [status, setStatus] = useState<ContactInquiryStatus>("idle");
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const setField = useCallback((field: ContactInquiryField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setInvalidFields((current) => {
      if (!current.has(field)) return current;
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  }, []);

  const submit = useCallback(async () => {
    if (abortRef.current) return;

    const parsed = contactInquirySchema.safeParse(values);
    if (!parsed.success) {
      setInvalidFields(new Set(collectInvalidContactFields(parsed.error)));
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setInvalidFields(new Set());
    setStatus("submitting");

    try {
      const outcome = await submitContactInquiry(parsed.data, controller.signal);
      if (outcome === "received") {
        setConfirmedEmail(parsed.data.email);
        setValues(EMPTY_VALUES);
        setStatus("success");
      } else if (outcome === "invalid") {
        setStatus("idle");
      } else {
        setStatus(outcome === "rate-limited" ? "rate-limited" : "error");
      }
    } catch {
      return;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [values]);

  return { values, invalidFields, status, confirmedEmail, setField, submit };
}
