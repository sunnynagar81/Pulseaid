import { Link } from "react-router-dom";
import { Droplet, Hospital, ArrowRight } from "lucide-react";
import { AuthLayout } from "../../components/layout/AuthLayout";

export default function RegisterChoice() {
  return (
    <AuthLayout title="Create an account" subtitle="How will you be using PulseAid?">
      <div className="space-y-3">
        <ChoiceCard to="/register/donor" icon={Droplet} title="I'm a donor" desc="Get alerted when someone nearby needs your blood type" />
        <ChoiceCard to="/register/hospital" icon={Hospital} title="I'm a hospital" desc="Post requests and reach compatible donors instantly" />
      </div>
      <p className="text-center text-sm text-ink-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-teal-700 font-medium hover:text-teal-800">Log in</Link>
      </p>
    </AuthLayout>
  );
}

function ChoiceCard({ to, icon: Icon, title, desc }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 rounded-xl border border-ink-200 hover:border-teal-400 hover:bg-teal-50/50 transition-colors group focus-ring"
    >
      <div className="h-11 w-11 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-ink-900">{title}</p>
        <p className="text-sm text-ink-500">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}