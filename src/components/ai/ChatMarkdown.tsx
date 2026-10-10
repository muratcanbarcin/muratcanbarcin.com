import type { ReactNode } from "react";

interface ChatMarkdownProps {
  content: string;
}

const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

/** Renders the assistant's markdown as elements. Raw HTML is never interpolated. */
export function ChatMarkdown({ content }: ChatMarkdownProps) {
  const blocks = splitFences(content);
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-zinc-300">
      {blocks.map((block, index) =>
        block.kind === "code" ? (
          <pre
            key={`code-${index}`}
            className="overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs leading-5 text-zinc-200"
          >
            <code>{block.value}</code>
          </pre>
        ) : (
          <TextBlock key={`text-${index}`} text={block.value} />
        ),
      )}
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1]?.length ?? 1;
      const headingText = heading[2] ?? "";
      const className =
        level === 1
          ? "text-base font-semibold text-zinc-100"
          : "text-sm font-semibold text-zinc-100";
      nodes.push(
        <p key={`h-${index}`} className={className}>
          {renderInline(headingText, `h-${index}`)}
        </p>,
      );
      index += 1;
      continue;
    }

    if (isUnordered(line) || isOrdered(line)) {
      const ordered = isOrdered(line);
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index] ?? "";
        if (ordered ? !isOrdered(current) : !isUnordered(current)) break;
        items.push(current.replace(ordered ? /^\d+[.)]\s+/ : /^[-*]\s+/, ""));
        index += 1;
      }
      const List = ordered ? "ol" : "ul";
      nodes.push(
        <List
          key={`list-${index}`}
          className={ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}
        >
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, `li-${index}-${itemIndex}`)}</li>
          ))}
        </List>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? "";
      if (!current.trim() || isUnordered(current) || isOrdered(current) || /^#{1,3}\s+/.test(current)) break;
      paragraph.push(current);
      index += 1;
    }
    nodes.push(
      <p key={`p-${index}`}>{renderInline(paragraph.join(" "), `p-${index}`)}</p>,
    );
  }

  return <>{nodes}</>;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${matchIndex}`} className="font-semibold text-zinc-100">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${matchIndex}`}
          className="rounded bg-zinc-950 px-1 py-px font-mono text-[0.85em] text-emerald-200/90"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      const label = link?.[1] ?? token;
      const href = link?.[2];
      nodes.push(
        href && isSafeHref(href) ? (
          <a
            key={`${keyPrefix}-a-${matchIndex}`}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="underline decoration-zinc-600 underline-offset-4 hover:text-zinc-100"
          >
            {label}
          </a>
        ) : (
          <span key={`${keyPrefix}-a-${matchIndex}`}>{label}</span>
        ),
      );
    }

    cursor = start + token.length;
    matchIndex += 1;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function splitFences(content: string): Array<{ kind: "text" | "code"; value: string }> {
  const blocks: Array<{ kind: "text" | "code"; value: string }> = [];
  const parts = content.split("```");
  parts.forEach((part, index) => {
    if (index % 2 === 0) {
      if (part.trim()) blocks.push({ kind: "text", value: part.trim() });
      return;
    }
    const newline = part.indexOf("\n");
    const code = newline === -1 ? part : part.slice(newline + 1);
    blocks.push({ kind: "code", value: code.replace(/\n$/, "") });
  });
  return blocks;
}

function isUnordered(line: string): boolean {
  return /^[-*]\s+/.test(line);
}

function isOrdered(line: string): boolean {
  return /^\d+[.)]\s+/.test(line);
}

function isSafeHref(href: string): boolean {
  return href.startsWith("https://") || href.startsWith("http://") || href.startsWith("mailto:");
}
