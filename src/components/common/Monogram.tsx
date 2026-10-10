import { cn } from "@/lib/utils";

interface MonogramProps {
  label: string;
  className?: string;
  onClick?: () => void;
}

export function Monogram({ label, className, onClick }: MonogramProps) {
  return (
    <a
      href="#top"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex h-11 items-center gap-1.5 rounded-md font-mono text-sm font-semibold tracking-tight text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60",
        className,
      )}
    >
      MCB
      <span aria-hidden="true" className="text-[11px] font-normal text-zinc-600">
        [<span className="animate-blink text-emerald-400 motion-reduce:animate-none">●</span>]
      </span>
    </a>
  );
}
