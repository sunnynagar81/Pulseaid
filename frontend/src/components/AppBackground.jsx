/**
 * Lighter version — large, heavily blurred (blur-3xl) full-viewport
 * shapes are GPU-expensive, especially stacked with the sidebar's
 * backdrop-blur. Smaller blobs + a lower blur radius keep the same
 * soft, colorful look with far less rendering cost, which is what
 * was likely causing the flicker on less powerful hardware.
 */
export function AppBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-teal-50/60 via-white to-ink-50">
      <div className="absolute -top-20 -right-16 w-80 h-80 rounded-full bg-teal-200/25 blur-2xl" />
      <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-coral-200/20 blur-2xl" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpath d='M54 20h12v26h26v12H66v26H54V58H28V46h26z' fill='%230F766E'/%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
        }}
      />
    </div>
  );
}