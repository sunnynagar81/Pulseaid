import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export const Select = forwardRef(({ className, label, error, options, id, ...props }, ref) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full h-11 rounded-xl border bg-white px-3.5 pr-9 text-sm text-ink-800 appearance-none",
            "transition-shadow duration-150 focus-ring",
            error ? "border-red-400" : "border-ink-200 hover:border-ink-300",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Select.displayName = "Select";