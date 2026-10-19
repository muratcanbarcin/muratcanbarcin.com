"use client";

import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { useLocale } from "@/hooks/useLocale";
import { useModalDialog } from "@/hooks/useModalDialog";
import { requestConsole } from "@/services/consoleEvents";
import { GitHubIcon } from "@/components/common/BrandIcons";
import { actionVariants } from "@/components/ui/action";
import { cn } from "@/lib/utils";

interface ProjectReadmePayload {
  markdown: string;
  githubUrl: string;
  title: string;
  branch: string;
}

interface ProjectReadmeModalProps {
  projectId: string;
  title: string;
  githubUrl: string;
  branch: string;
  isOpen: boolean;
  onClose: () => void;
}

const BADGE_LINK = /\[!\[[^\]]*\]\(https:\/\/img\.shields\.io\/[^)]+\)\]\([^)\s]+\)/g;

/** Consecutive shield lines become one wrapping row instead of full-width blocks. */
function groupShieldBadges(markdown: string): string {
  return markdown.replace(new RegExp(`(?:${BADGE_LINK.source}[ \\t]*\\n?)+`, "g"), (group) => {
    const badges = group.match(new RegExp(BADGE_LINK.source, "g"));
    if (!badges || badges.length === 0) return group;
    return `${badges.join(" ")}\n\n`;
  });
}

function isBadgeImage(src: string): boolean {
  try {
    return new URL(src).hostname === "img.shields.io";
  } catch {
    return src.includes("img.shields.io");
  }
}

function resolveHref(href: string | undefined, githubUrl: string, branch: string): string | undefined {
  if (!href || /^(https?:|mailto:|#)/i.test(href)) return href;
  const path = href.replace(/^\.\//, "").replace(/^\//, "");
  return `${githubUrl.replace(/\/$/, "")}/blob/${encodeURIComponent(branch)}/${path}`;
}

function markdownComponents(githubUrl: string, branch: string): Components {
  return {
    a: ({ href, children }) => (
      <a href={resolveHref(href, githubUrl, branch)} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    img: ({ src, alt }) => {
      if (typeof src !== "string") return null;
      const badge = isBadgeImage(src);
      const tallBadge = badge && src.includes("for-the-badge");
      return (
        // Remote README assets are not known at build time.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          className={
            badge
              ? cn("mr-1.5 mb-1.5 inline-block w-auto max-w-full align-middle", tallBadge ? "h-7" : "h-5")
              : "my-2 block h-auto max-h-80 w-auto max-w-full rounded-lg border border-zinc-800 object-contain"
          }
        />
      );
    },
    pre: ({ children }) => (
      <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-[13px] leading-relaxed text-zinc-100">
        {children}
      </pre>
    ),
    code: ({ className, children }) => {
      const isBlock = Boolean(className?.includes("language-"));
      if (isBlock) return <code className={cn("font-mono text-[13px] text-zinc-100", className)}>{children}</code>;
      return (
        <code className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-100">
          {children}
        </code>
      );
    },
  };
}

export function ProjectReadmeModal({
  projectId,
  title,
  githubUrl,
  branch,
  isOpen,
  onClose,
}: ProjectReadmeModalProps) {
  const { t } = useLocale();
  const titleId = useId();
  const { dialogRef, onBackdropClick } = useModalDialog({ isOpen, onClose });
  const [documentState, setDocumentState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setDocumentState("loading");
    setMarkdown("");

    const load = async () => {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/readme`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("unavailable");
        const payload: unknown = await response.json();
        if (!isReadmePayload(payload)) throw new Error("invalid");
        setMarkdown(groupShieldBadges(payload.markdown));
        setDocumentState("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDocumentState("error");
      }
    };

    void load();
    return () => controller.abort();
  }, [isOpen, projectId]);

  const discuss = () => {
    onClose();
    requestConsole({ action: "open" });
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-busy={documentState === "loading"}
      onClose={onClose}
      onClick={onBackdropClick}
      className={cn(
        "m-auto flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-3xl flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 p-0 text-zinc-300 shadow-2xl shadow-black/10 backdrop-blur-xl dark:shadow-black/60",
        "backdrop:bg-black/40 backdrop:backdrop-blur-sm dark:backdrop:bg-zinc-950/70",
        "scale-[0.98] opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-200 open:scale-100 open:opacity-100 starting:open:scale-[0.98] starting:open:opacity-0 motion-reduce:transition-none",
      )}
    >
      <header className="flex items-start gap-3 border-b border-zinc-800 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-zinc-100">
            {title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
              {branch}
            </span>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(actionVariants({ intent: "secondary", size: "md" }), "font-mono text-xs")}
            >
              <GitHubIcon className="size-3.5" aria-hidden="true" />
              {t("projects.viewOnGitHub")}
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("projects.closeDocs")}
          className={actionVariants({ intent: "ghost", size: "icon" })}
        >
          <X aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        {documentState === "loading" && <ReadmeSkeleton label={t("projects.docsLoading")} />}
        {documentState === "error" && <p className="text-sm text-zinc-400">{t("projects.docsError")}</p>}
        {documentState === "ready" && (
          <article className="space-y-4 text-sm leading-relaxed text-zinc-300 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-700 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-400 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-zinc-100 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h3]:mt-5 [&_h3]:font-semibold [&_h3]:text-zinc-100 [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:text-pretty [&_strong]:font-semibold [&_strong]:text-zinc-100 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_td]:border-b [&_td]:border-zinc-800 [&_td]:px-2 [&_td]:py-1.5 [&_th]:border-b [&_th]:border-zinc-700 [&_th]:px-2 [&_th]:py-1.5 [&_th]:font-medium [&_th]:text-zinc-200 [&_ul]:list-disc [&_ul]:space-y-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={markdownComponents(githubUrl, branch)}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        )}
      </div>

      <footer className="flex flex-col gap-3 border-t border-zinc-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-zinc-400">{t("projects.docsDiscuss")}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={discuss} className={actionVariants({ intent: "primary", size: "md" })}>
            {t("projects.openMcb")}
          </button>
          <a href="#contact" onClick={onClose} className={actionVariants({ intent: "secondary", size: "md" })}>
            {t("projects.contactMurat")}
          </a>
        </div>
      </footer>
    </dialog>
  );
}

function ReadmeSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3" role="status">
      <span className="sr-only">{label}</span>
      <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-800" />
      <div className="h-4 w-full animate-pulse rounded bg-zinc-800/80" />
      <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-800/80" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-800/70" />
      <div className="mt-3 h-44 animate-pulse rounded-lg bg-zinc-900" />
    </div>
  );
}

function isReadmePayload(value: unknown): value is ProjectReadmePayload {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.markdown === "string" &&
    typeof record.githubUrl === "string" &&
    typeof record.title === "string" &&
    typeof record.branch === "string"
  );
}
