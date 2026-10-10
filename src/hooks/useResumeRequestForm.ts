"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeRequestField, ResumeRequestPayload } from "@/types";
import { collectInvalidFields, resumeRequestSchema } from "@/lib/resumeRequestSchema";
import { submitResumeRequest } from "@/services/resumeRequest";

export type ResumeRequestStatus = "idle" | "submitting" | "success" | "rate-limited" | "error";

const EMPTY_VALUES: ResumeRequestPayload = { email: "", company: "", message: "" };

export interface ResumeRequestForm {
  values: ResumeRequestPayload;
  invalidFields: ReadonlySet<ResumeRequestField>;
  status: ResumeRequestStatus;
  /** Normalized address echoed back in the confirmation. */
  confirmedEmail: string | null;
  setField: (field: ResumeRequestField, value: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useResumeRequestForm(): ResumeRequestForm {
  const [values, setValues] = useState<ResumeRequestPayload>(EMPTY_VALUES);
  const [invalidFields, setInvalidFields] = useState<ReadonlySet<ResumeRequestField>>(new Set());
  const [status, setStatus] = useState<ResumeRequestStatus>("idle");
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const setField = useCallback((field: ResumeRequestField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setInvalidFields((current) => {
      if (!current.has(field)) return current;
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setValues(EMPTY_VALUES);
    setInvalidFields(new Set());
    setStatus("idle");
    setConfirmedEmail(null);
  }, []);

  const submit = useCallback(async () => {
    if (abortRef.current) return;

    const parsed = resumeRequestSchema.safeParse(values);
    if (!parsed.success) {
      setInvalidFields(new Set(collectInvalidFields(parsed.error)));
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setInvalidFields(new Set());
    setStatus("submitting");

    try {
      const outcome = await submitResumeRequest(parsed.data, controller.signal);
      if (outcome === "received") {
        setConfirmedEmail(parsed.data.email);
        setStatus("success");
      } else {
        setStatus(outcome === "rate-limited" ? "rate-limited" : "error");
      }
    } catch {
      return;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [values]);

  return { values, invalidFields, status, confirmedEmail, setField, submit, reset };
}
