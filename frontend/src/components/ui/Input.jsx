import { forwardRef, useId } from "react";
import { cn } from "../../lib/cn";

/**
 * label + error are handled inside the component (not left to every
 * page to lay out by hand) so every form in the app looks identical
 * without each page re-deriving spacing/error styling.
 */
export const Input = forwardRef(
  ({ className, label, error, icon: Icon, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-ink-400 pointer-events-none" />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 rounded-xl border bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400",
              "transition-shadow duration-150 focus-ring",
              Icon && "pl-10",
              error ? "border-red-400" : "border-ink-200 hover:border-ink-300",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";