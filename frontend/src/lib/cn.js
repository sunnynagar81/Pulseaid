import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names (clsx) and then resolves Tailwind
 * conflicts (twMerge) so e.g. cn("px-2", condition && "px-4") correctly
 * ends up as just "px-4" instead of both classes fighting in the DOM.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}