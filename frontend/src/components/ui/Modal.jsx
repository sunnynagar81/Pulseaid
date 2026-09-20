import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Portal-rendered so it escapes any parent's overflow/z-index context
 * (the sidebar layout has its own stacking context) — without a portal,
 * a modal can silently render clipped or behind other elements.
 */
export function Modal({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
     <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative bg-white rounded-2xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 focus-ring rounded-lg p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}