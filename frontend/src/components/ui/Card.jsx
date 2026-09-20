import { cn } from "../../lib/cn";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn("rounded-2xl bg-white border border-ink-200 shadow-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn("px-6 pb-6", className)} {...props}>
      {children}
    </div>
  );
}