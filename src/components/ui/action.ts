import { cva, type VariantProps } from "class-variance-authority";

/** Shared styling for links and buttons; every size keeps a 44px touch target below `lg`. */
export const actionVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      intent: {
        primary: "bg-zinc-100 text-zinc-950 hover:bg-white",
        secondary:
          "border border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/70",
        ghost: "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
      },
      size: {
        lg: "h-11 px-5 text-sm",
        md: "h-11 px-3.5 text-[13px] lg:h-9",
        icon: "size-11 lg:size-9",
      },
    },
    defaultVariants: {
      intent: "secondary",
      size: "md",
    },
  },
);

export type ActionVariantProps = VariantProps<typeof actionVariants>;
