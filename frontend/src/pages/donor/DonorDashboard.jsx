import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Droplet, Bell } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Toggle } from "../../components/ui/Toggle";
import { Spinner } from "../../components/ui/Spinner";
import { MatchCard } from "../../components/MatchCard";
import { CoverageMap } from "../../components/CoverageMap";
import { ImpactModal } from "../../components/ImpactModal";
import { useAuthStore } from "../../store/authStore";
import { useSocket } from "../../contexts/SocketContext";
import { getEligibility, updateAvailability, getMyMatches } from "../../api/donors";

export default function DonorDashboard() {
  const { user } = useAuthStore();
  const { socket } = useSocket();

  const [eligibility, setEligibility] = useState(null);
  const [available, setAvailable] = useState(user?.isAvailable ?? true);
  const [matches, setMatches] = useState(null);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [impactData, setImpactData] = useState(null);

  useEffect(() => {
    getEligibility().then(({ data }) => setEligibility(data)).catch(() => {});
    getMyMatches().then(({ data }) => setMatches(data)).catch(() => setMatches([]));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewAlert = (alert) => {
      toast.custom(() => (
        <div className="bg-white rounded-xl shadow-float border border-teal-200 px-4 py-3 flex items-center gap-3 max-w-sm">
          <div className="h-9 w-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Bell className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-900">New blood request nearby</p>
            <p className="text-xs text-ink-500">{alert.hospitalName} needs {alert.bloodType}</p>
          </div>
        </div>
      ));

      setMatches((prev) => [
        {
          _id: alert.matchId,
          status: "notified",
          distanceKm: alert.distanceKm,
          createdAt: new Date().toISOString(),
          request: {
            bloodType: alert.bloodType,
            unitsNeeded: alert.unitsNeeded,
            urgency: alert.urgency,
            hospital: { name: alert.hospitalName },
          },
        },
        ...(prev || []),
      ]);
    };

    socket.on("new-alert", handleNewAlert);
    return () => socket.off("new-alert", handleNewAlert);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleDonationConfirmed = (payload) => {
      setImpactData(payload);
      setMatches((prev) =>
        (prev || []).map((m) => (m._id === payload.matchId ? { ...m, status: "completed" } : m))
      );
    };

    socket.on("donation-confirmed", handleDonationConfirmed);
    return () => socket.off("donation-confirmed", handleDonationConfirmed);
  }, [socket]);

  const handleToggleAvailability = async (next) => {
    setTogglingAvailability(true);
    const prev = available;
    setAvailable(next);
    try {
      await updateAvailability(next);
    } catch {
      setAvailable(prev);
      toast.error("Could not update availability");
    } finally {
      setTogglingAvailability(false);
    }
  };

  const activeAlerts = matches?.filter((m) => m.status === "notified") || [];
  const pastAlerts = matches?.filter((m) => m.status !== "notified") || [];

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <EligibilityCard eligibility={eligibility} />

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-ink-500 mb-1">Availability</p>
            <p className="text-lg font-semibold text-ink-900">
              {available ? "Visible to hospitals" : "Not receiving alerts"}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-ink-500">{available ? "Available" : "Unavailable"}</span>
            <Toggle checked={available} onChange={handleToggleAvailability} disabled={togglingAvailability} />
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-ink-500 mb-1">Blood type</p>
          <div className="flex items-center gap-2 mt-1">
            <Droplet className="h-6 w-6 text-teal-700" />
            <span className="text-2xl font-display font-semibold text-ink-900">{user?.bloodType}</span>
          </div>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-ink-900 mb-3">Your coverage area</h2>
        <Card className="p-4">
          <CoverageMap coordinates={user?.location?.coordinates} label="You" color="teal" />
          <p className="text-xs text-ink-500 mt-3">
            You're alerted for any request posted within this 15km radius that matches your blood type.
          </p>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-ink-900 mb-3">
          Active alerts {activeAlerts.length > 0 && `(${activeAlerts.length})`}
        </h2>

        {matches === null ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : activeAlerts.length === 0 ? (
          <EmptyState text="No active alerts right now — you'll be notified instantly when a nearby request matches your blood type." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAlerts.map((m) => (
              <MatchCard
                key={m._id}
                match={m}
                onResponded={(id, status) =>
                  setMatches((prev) => prev.map((x) => (x._id === id ? { ...x, status } : x)))
                }
              />
            ))}
          </div>
        )}
      </section>

      {pastAlerts.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-ink-900 mb-3">Past alerts</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastAlerts.map((m) => (
              <MatchCard key={m._id} match={m} />
            ))}
          </div>
        </section>
      )}

      <ImpactModal
        open={!!impactData}
        onClose={() => setImpactData(null)}
        totalDonations={impactData?.totalDonations ?? 0}
      />
    </DashboardLayout>
  );
}

function EligibilityCard({ eligibility }) {
  if (!eligibility) {
    return (
      <Card className="p-5 flex items-center justify-center">
        <Spinner />
      </Card>
    );
  }

  return (
    <Card className={eligibility.isEligible ? "p-5 bg-teal-50 border-teal-200" : "p-5"}>
      <p className="text-sm font-medium text-ink-500 mb-1">Donation eligibility</p>
      <div className="flex items-center gap-2 mt-1">
        {eligibility.isEligible ? (
          <CheckCircle2 className="h-6 w-6 text-teal-700" />
        ) : (
          <Clock3 className="h-6 w-6 text-coral-500" />
        )}
        <span className="text-lg font-semibold text-ink-900">
          {eligibility.isEligible ? "Eligible now" : "Not yet eligible"}
        </span>
      </div>
      {!eligibility.isEligible && eligibility.nextEligibleDate && (
        <p className="text-xs text-ink-500 mt-2">
          Eligible again on {format(new Date(eligibility.nextEligibleDate), "d MMM yyyy")}
        </p>
      )}
      {eligibility.lastDonationDate && (
        <p className="text-xs text-ink-400 mt-1">
          Last donated {format(new Date(eligibility.lastDonationDate), "d MMM yyyy")}
        </p>
      )}
    </Card>
  );
}

function EmptyState({ text }) {
  return (
    <Card className="p-10 flex flex-col items-center text-center">
      <div className="h-12 w-12 rounded-full bg-ink-100 flex items-center justify-center mb-3">
        <Bell className="h-5 w-5 text-ink-400" />
      </div>
      <p className="text-sm text-ink-500 max-w-xs">{text}</p>
    </Card>
  );
}