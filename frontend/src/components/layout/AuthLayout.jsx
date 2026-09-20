import { HeartPulse, ShieldCheck, MapPin, Zap } from "lucide-react";

const FEATURES = [
  { icon: Zap, text: "Instant alerts the moment a compatible donor is nearby" },
  { icon: ShieldCheck, text: "Automatic 90-day eligibility tracking, no guesswork" },
  { icon: MapPin, text: "Graph-based proximity matching for the fastest response" },
];

/**
 * Split-screen: branding + value prop on the left (fixed, desktop only),
 * the actual form on the right. This is what separates a "real app" auth
 * screen from a bare centered card — it uses the space to reinforce why
 * the product exists, not just collect input.
 */
export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-teal-800 via-teal-700 to-navy-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
            <HeartPulse className="h-5 w-5" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">PulseAid</span>
        </div>

        <div className="relative">
          <h1 className="font-display text-4xl font-semibold leading-tight mb-4">
            Every pulse connected,
            <br />
            every life protected.
          </h1>
          <p className="text-teal-100/80 text-base mb-10 max-w-sm">
            A real-time network matching blood donors to emergency requests the moment they're posted.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-teal-50/90 pt-1.5">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-teal-100/50">
          &copy; {new Date().getFullYear()} PulseAid — Emergency blood response network
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-ink-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="h-9 w-9 rounded-lg bg-teal-700 flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-semibold text-lg text-ink-900">PulseAid</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-ink-900">{title}</h2>
            {subtitle && <p className="text-ink-500 text-sm mt-1.5">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}