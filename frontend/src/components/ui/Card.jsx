import { cn } from "../../lib/cn";

export function Card({ className, children, hoverable, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-ink-200 shadow-card transition-all duration-200",
        hoverable && "hover:shadow-float hover:-translate-y-0.5 hover:border-teal-200",
        className
      )}
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