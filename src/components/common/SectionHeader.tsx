interface SectionHeaderProps {
  /** Zero-padded ordinal, e.g. `"01"`. */
  index: string;
  /** Decorative shell command shown above the title. */
  command: string;
  title: string;
  description: string;
  titleId: string;
}

export function SectionHeader({ index, command, title, description, titleId }: SectionHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-3 sm:mb-10">
      <p className="flex items-center gap-3 font-mono text-xs text-zinc-500">
        <span className="text-zinc-600">{index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-zinc-800" />
        <span>
          <span aria-hidden="true" className="text-emerald-400/80">
            ${" "}
          </span>
          {command}
        </span>
      </p>
      <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">{description}</p>
    </header>
  );
}
