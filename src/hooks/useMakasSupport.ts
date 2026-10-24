"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MakasSupportField, MakasSupportFormValues, MakasSupportPayload } from "@/types";
import { collectInvalidMakasSupportFields, makasSupportSchema } from "@/lib/makasSupportSchema";
import { submitMakasSupport } from "@/services/makasSupport";

export type MakasSupportStatus = "idle" | "submitting" | "success" | "rate-limited" | "error";

const EMPTY_VALUES: MakasSupportFormValues = {
  name: "",
  email: "",
  phone: "",
  shopName: "",
  subject: "",
  message: "",
};

export interface MakasSupportFormState {
  values: MakasSupportFormValues;
  invalidFields: ReadonlySet<MakasSupportField>;
  status: MakasSupportStatus;
  setField: (field: MakasSupportField, value: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useMakasSupport(): MakasSupportFormState {
  const [values, setValues] = useState<MakasSupportFormValues>(EMPTY_VALUES);
  const [invalidFields, setInvalidFields] = useState<ReadonlySet<MakasSupportField>>(new Set());
  const [status, setStatus] = useState<MakasSupportStatus>("idle");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const setField = useCallback((field: MakasSupportField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setInvalidFields((current) => {
      if (!current.has(field)) return current;
      const next = new Set(current);
      next.delete(field);
      return next;
    });
    setStatus((current) => (current === "error" || current === "rate-limited" ? "idle" : current));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setValues(EMPTY_VALUES);
    setInvalidFields(new Set());
    setStatus("idle");
  }, []);

  const submit = useCallback(async () => {
    if (abortRef.current) return;

    const parsed = makasSupportSchema.safeParse(values);
    if (!parsed.success) {
      setInvalidFields(new Set(collectInvalidMakasSupportFields(parsed.error)));
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setInvalidFields(new Set());
    setStatus("submitting");

    try {
      const result = await submitMakasSupport(parsed.data satisfies MakasSupportPayload, controller.signal);
      if (result.outcome === "received") {
        setValues(EMPTY_VALUES);
        setStatus("success");
      } else if (result.outcome === "invalid") {
        setInvalidFields(new Set(result.fields));
        setStatus("idle");
      } else {
        setStatus(result.outcome === "rate-limited" ? "rate-limited" : "error");
      }
    } catch {
      return;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [values]);

  return { values, invalidFields, status, setField, submit, reset };
}
