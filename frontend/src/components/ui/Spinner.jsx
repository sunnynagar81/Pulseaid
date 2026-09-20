import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export function Spinner({ className, size = 20 }) {
  return <Loader2 className={cn("animate-spin text-teal-700", className)} size={size} />;
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}