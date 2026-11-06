"use client";

import { ArrowUpRight, LockKeyhole, X } from "lucide-react";
import { Popover } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { skillProjectCopy, skillProjects } from "@/data/skillProjects";
import { useLocale } from "@/hooks/useLocale";
import { GitHubIcon } from "@/components/common/BrandIcons";

export function SkillProjectPopover({ skill }: { skill: string }) {
  const { localize } = useLocale();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFocusOpen = useRef(false);
  const references = skillProjects[skill] ?? [];

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      const active = document.activeElement;
      if (active !== trigger.current && !content.current?.contains(active)) setOpen(false);
    }, 180);
  };

  const closeAndRestoreFocus = () => {
    cancelClose();
    skipFocusOpen.current = document.activeElement !== trigger.current;
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          ref={trigger}
          type="button"
          aria-label={`${localize(skillProjectCopy.openProjects)} ${skill}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-left font-mono text-[11px] text-zinc-300 transition-colors outline-none hover:border-emerald-500/40 hover:text-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-400/60 data-[state=open]:border-emerald-500/40 data-[state=open]:text-emerald-200 sm:min-h-7"
          onPointerEnter={(event) => {
            if (event.pointerType === "touch") return;
            cancelClose();
            setOpen(true);
          }}
          onPointerLeave={scheduleClose}
          onFocus={() => {
            cancelClose();
            if (skipFocusOpen.current) skipFocusOpen.current = false;
            else setOpen(true);
          }}
          onBlur={scheduleClose}
          onClick={(event) => {
            // Focus may already have opened the panel before this click/tap.
            event.preventDefault();
            cancelClose();
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (open && (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey))) {
              event.preventDefault();
              content.current?.querySelector<HTMLElement>("a, button")?.focus();
            }
          }}
        >
          {skill}
          <ArrowUpRight aria-hidden="true" className="size-3 shrink-0 text-zinc-500" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          ref={content}
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          aria-label={`${skill} · ${localize(skillProjectCopy.relatedProjects)}`}
          className="z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-zinc-100 shadow-xl shadow-black/40 outline-none"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          onBlur={scheduleClose}
          onEscapeKeyDown={closeAndRestoreFocus}
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const items = content.current?.querySelectorAll<HTMLElement>("a, button");
            if (!items?.length) return;
            if (event.shiftKey && event.target === items[0]) {
              event.preventDefault();
              trigger.current?.focus();
            } else if (!event.shiftKey && event.target === items[items.length - 1]) {
              // Continue the page's natural tab order from the skill trigger.
              closeAndRestoreFocus();
            }
          }}
        >
          <p className="px-2 pt-1 font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
            {localize(skillProjectCopy.relatedProjects)}
          </p>
          <h4 className="px-2 pt-1 pb-3 text-sm font-semibold">{skill}</h4>
          <ul className="flex flex-col gap-1">
            {references.map((reference) => (
              <li key={reference.title}>
                {reference.url ? (
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-sm text-zinc-300 transition-colors outline-none hover:bg-zinc-800 hover:text-emerald-200 focus-visible:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                  >
                    <GitHubIcon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">{reference.title}</span>
                    <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <div className="flex items-start gap-3 px-2 py-2 text-sm">
                    <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                    <div>
                      <p>{reference.title}</p>
                      {reference.note && <p className="mt-1 text-xs leading-relaxed text-zinc-500">{localize(reference.note)}</p>}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={closeAndRestoreFocus}
            className="mt-2 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 text-xs text-zinc-400 outline-none hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          >
            <X aria-hidden="true" className="size-3.5" />
            {localize(skillProjectCopy.close)}
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
