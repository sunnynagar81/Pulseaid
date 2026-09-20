import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const VARIANTS = {
  primary: "bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 shadow-soft",
  coral: "bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 shadow-soft",
  outline: "border border-ink-300 text-ink-700 hover:bg-ink-100 active:bg-ink-200",
  ghost: "text-ink-600 hover:bg-ink-100 active:bg-ink-200",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
};

/**
 * forwardRef matters here: react-hook-form and Radix-style focus
 * management both need a real DOM ref to the underlying <button>.
 */
export const Button = forwardRef(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-150",
          "focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";