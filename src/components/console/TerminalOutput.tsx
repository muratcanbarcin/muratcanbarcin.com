import type { TerminalLine, TerminalTone } from "@/types";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<TerminalTone, string> = {
  default: "text-zinc-300",
  muted: "text-zinc-500",
  accent: "text-emerald-300",
  heading: "font-semibold text-zinc-100",
  error: "text-red-400",
  success: "text-emerald-400",
};

const MAX_LABEL_CHARS = 20;
const LABEL_SLACK_CH = 2;

function measureLabelColumn(lines: readonly TerminalLine[]): string | undefined {
  const longest = lines.reduce((max, line) => Math.max(max, line.label?.length ?? 0), 0);
  if (longest === 0) return undefined;
  return `min(${Math.min(longest, MAX_LABEL_CHARS) + LABEL_SLACK_CH}ch, 50%)`;
}

export function TerminalOutput({ lines }: { lines: readonly TerminalLine[] }) {
  if (lines.length === 0) return null;
  const labelWidth = measureLabelColumn(lines);
  return (
    <div className="flex flex-col">
      {lines.map((line, index) => (
        <div key={index} className="flex min-h-6 gap-3">
          {line.label !== undefined && (
            <span style={{ width: labelWidth }} className="shrink-0 truncate text-zinc-500">
              {line.label}
            </span>
          )}
          <span className={cn("min-w-0 break-words", TONE_CLASSES[line.tone ?? "default"])}>
            {line.href ? (
              <a
                href={line.href}
                {...(!line.href.startsWith("mailto:") && { target: "_blank", rel: "noopener noreferrer" })}
                className="underline decoration-zinc-700 underline-offset-4 hover:text-zinc-100 hover:decoration-zinc-400"
              >
                {line.text}
              </a>
            ) : (
              line.text
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
