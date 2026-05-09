import * as React from "react";
import { cn } from "../lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base"
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 shadow-glow hover:brightness-110 active:brightness-95",
  outline:
    "border border-white/14 bg-white/6 text-sand-50 hover:bg-white/10 active:bg-white/6",
  ghost: "text-sand-50/90 hover:bg-white/8 active:bg-white/6"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition focus:outline-none focus:ring-2 focus:ring-gold-400/40 disabled:opacity-60",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

