import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export function AccordionItem({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-ink-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus-ring"
      >
        <span className="font-medium text-ink-900">{question}</span>
        <ChevronDown className={cn("h-4 w-4 text-ink-400 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-ink-600 leading-relaxed">{answer}</div>
      )}
    </div>
  );
}