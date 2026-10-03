import { cn } from "../../lib/cn";

/**
 * A pulsing placeholder block. Shaped to match whatever it's standing
 * in for (pass width/height via className) rather than a single plain
 * spinner — this is what makes a loading state feel like "the content
 * is arriving" instead of "something is broken, please wait."
 */
export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-lg bg-ink-200/70", className)} />;
}

export function SkeletonMatchCard() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-ink-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-40 mt-4" />
      <Skeleton className="h-3 w-24 mt-3" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonRequestCard() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-ink-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full mt-5" />
      <div className="flex gap-4 mt-4 pt-4 border-t border-ink-100">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-9 w-full rounded-xl mt-4" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-ink-200">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-24" />
    </div>
  );
}