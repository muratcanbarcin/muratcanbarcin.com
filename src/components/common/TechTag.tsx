import { cn } from "@/lib/utils";

interface TechTagProps {
  label: string;
  className?: string;
}

export function TechTag({ label, className }: TechTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-0.5 font-mono text-[11px] leading-5 text-zinc-400",
        className,
      )}
    >
      {label}
    </span>
  );
}

interface TechTagListProps {
  items: readonly string[];
  label: string;
  className?: string;
}

export function TechTagList({ items, label, className }: TechTagListProps) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <li key={item}>
          <TechTag label={item} />
        </li>
      ))}
    </ul>
  );
}
