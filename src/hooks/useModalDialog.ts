"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent, RefObject } from "react";

interface ModalDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

interface ModalDialogBindings {
  dialogRef: RefObject<HTMLDialogElement | null>;
  /** Closes when the backdrop itself is clicked; content clicks bubble from inner elements. */
  onBackdropClick: (event: MouseEvent<HTMLDialogElement>) => void;
}

/**
 * Syncs a native `<dialog>` with React state: top-layer `showModal()` gives focus containment for
 * free, while page scroll is locked and Escape is routed through `onClose` so state never drifts.
 */
export function useModalDialog({ isOpen, onClose, initialFocusRef }: ModalDialogOptions): ModalDialogBindings {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      initialFocusRef?.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, initialFocusRef]);

  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return { dialogRef, onBackdropClick };
}
