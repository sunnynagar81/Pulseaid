import { CheckCircle2, LocateFixed, MapPin } from "lucide-react";
import { cn } from "../lib/cn";

export function LocationCapture({ status, error, onCapture }) {
  if (status === "success") {
    return (
      <div className="flex items-center justify-between gap-2 text-sm text-teal-700 bg-teal-50 rounded-lg px-3 py-2.5">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Location captured
        </span>
        <button type="button" onClick={onCapture} className="text-xs font-medium underline shrink-0">
          Update
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onCapture}
        disabled={status === "loading"}
        className={cn(
          "w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed text-sm font-medium transition-colors focus-ring",
          "border-teal-300 text-teal-700 hover:bg-teal-50 disabled:opacity-60"
        )}
      >
        <LocateFixed className="h-4 w-4" />
        {status === "loading" ? "Getting your location…" : "Share my location"}
      </button>
      {status === "error" && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {error || "Location access denied"}
        </p>
      )}
      <p className="mt-1.5 text-xs text-ink-400">Required so we can match you with nearby requests.</p>
    </div>
  );
}