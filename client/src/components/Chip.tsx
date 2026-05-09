import { cn } from "../lib/cn";

export function Chip({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/14 bg-white/6 px-3 py-1 text-xs font-semibold tracking-wide text-sand-50/90",
        className
      )}
    >
      {children}
    </span>
  );
}

