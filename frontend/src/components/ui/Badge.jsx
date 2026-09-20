import { cn } from "../../lib/cn";

const VARIANTS = {
  teal: "bg-teal-100 text-teal-800",
  coral: "bg-coral-100 text-coral-700",
  navy: "bg-navy-700/10 text-navy-700",
  gray: "bg-ink-100 text-ink-600",
  red: "bg-red-100 text-red-700",
};

export function Badge({ className, variant = "gray", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}