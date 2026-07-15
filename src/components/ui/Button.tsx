import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--system-blue)] text-white hover:brightness-110 active:brightness-95",
  secondary:
    "bg-black/[0.06] text-[var(--label)] hover:bg-black/[0.09] dark:bg-white/[0.1]",
  ghost:
    "bg-transparent text-[var(--system-blue)] hover:bg-[var(--system-blue)]/10",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-[15px] font-medium transition disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
