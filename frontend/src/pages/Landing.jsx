import { Link } from "react-router-dom";
import {
  HeartPulse,
  Zap,
  ShieldCheck,
  MapPin,
  Bell,
  Droplet,
  Hospital as HospitalIcon,
  BarChart3,
  ArrowRight,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const STATS = [
  { n: "4.5 Cr+", d: "units of blood needed annually in India" },
  { n: "1 Cr+", d: "unit shortfall reported each year" },
  { n: "90 Days", d: "mandatory donation gap, tracked automatically" },
];

const STEPS = [
  { icon: HospitalIcon, t: "Post a request", d: "Hospital posts blood type, units needed, and urgency" },
  { icon: Zap, t: "Instant matching", d: "Engine filters by compatibility, 90-day eligibility, and proximity" },
  { icon: Bell, t: "Live alerts", d: "Only matched donors get a real-time notification" },
  { icon: BarChart3, t: "Track responses", d: "Hospital sees live donor responses as they happen" },
];

const FEATURES = [
  { icon: Zap, t: "Real-time alerts", d: "Socket.io push notifications the moment a match is found — no refresh needed" },
  { icon: ShieldCheck, t: "Automatic eligibility", d: "The 90-day donation gap is tracked for you, not left to memory" },
  { icon: MapPin, t: "Proximity matching", d: "A live coverage map shows exactly who's in range for each request" },
  { icon: Users, t: "Built for both sides", d: "Purpose-built dashboards for donors and hospitals, not one generic view" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-700 flex items-center justify-center">
              <HeartPulse className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-display font-semibold text-ink-900">PulseAid</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-ink-600 hover:text-ink-900 px-3 py-2">
              Log in
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium mb-6">
          <Zap className="h-3 w-3" />
          Real-time emergency blood response
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink-900 leading-tight max-w-3xl mx-auto">
          Every pulse connected, <br className="hidden sm:block" />
          every life protected.
        </h1>
        <p className="text-ink-500 text-lg mt-5 max-w-xl mx-auto">
          PulseAid instantly matches emergency blood requests with compatible, eligible, nearby donors —
          the moment a request is posted, not after someone starts making phone calls.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/register/donor">
            <Button size="lg">
              <Droplet className="h-4 w-4" />
              Become a Donor
            </Button>
          </Link>
          <Link to="/register/hospital">
            <Button size="lg" variant="outline">
              <HospitalIcon className="h-4 w-4" />
              Register Hospital
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {STATS.map((s) => (
            <Card key={s.n} className="p-6 text-center">
              <p className="font-display text-3xl font-semibold text-teal-700">{s.n}</p>
              <p className="text-sm text-ink-500 mt-1">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-ink-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center font-display text-2xl font-semibold text-ink-900 mb-10">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ icon: Icon, t, d }, i) => (
              <div key={t} className="text-center">
                <div className="h-12 w-12 rounded-xl bg-teal-700 text-white flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-coral-500 mb-1">STEP {i + 1}</p>
                <p className="font-medium text-ink-900 mb-1">{t}</p>
                <p className="text-sm text-ink-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-center font-display text-2xl font-semibold text-ink-900 mb-10">Built to actually work</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, t, d }) => (
            <Card key={t} className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-ink-900">{t}</p>
                <p className="text-sm text-ink-500 mt-0.5">{d}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-teal-800 text-white py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
            Your next alert could save a life.
          </h2>
          <p className="text-teal-100/80 mb-8">Join PulseAid in under a minute — no cost, no hidden steps.</p>
          <Link to="/register">
            <Button size="lg" variant="coral">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-ink-400">
          <span>&copy; {new Date().getFullYear()} PulseAid</span>
          <span>Every Pulse Connected, Every Life Protected</span>
        </div>
      </footer>
    </div>
  );
}