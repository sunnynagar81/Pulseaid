import { useEffect, useState } from "react";
import { Plus, ClipboardList, CircleDot, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { RequestCard } from "../../components/RequestCard";
import { NewRequestModal } from "../../components/NewRequestModal";
import { CoverageMap } from "../../components/CoverageMap";
import { useSocket } from "../../contexts/SocketContext";
import { getDashboard } from "../../api/hospitals";
import { useAuthStore } from "../../store/authStore";

export default function HospitalDashboard() {
  const { socket } = useSocket();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadDashboard = () => getDashboard().then(({ data }) => setData(data));

  useEffect(() => {
    loadDashboard().catch(() => toast.error("Could not load dashboard"));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMatchUpdated = (payload) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          requests: prev.requests.map((r) =>
            r._id === payload.requestId
              ? {
                  ...r,
                  unitsConfirmed: payload.unitsConfirmed,
                  status: payload.requestStatus,
                  stats: {
                    ...r.stats,
                    accepted: payload.status === "accepted" ? r.stats.accepted + 1 : r.stats.accepted,
                    declined: payload.status === "declined" ? r.stats.declined + 1 : r.stats.declined,
                  },
                }
              : r
          ),
        };
      });

      if (payload.status === "accepted") {
        toast.success("A donor accepted your request!");
      }
    };

    const handleExpired = (payload) => {
      setData((prev) =>
        prev
          ? { ...prev, requests: prev.requests.map((r) => (r._id === payload.requestId ? { ...r, status: "expired" } : r)) }
          : prev
      );
    };

    socket.on("match-updated", handleMatchUpdated);
    socket.on("request-expired", handleExpired);
    return () => {
      socket.off("match-updated", handleMatchUpdated);
      socket.off("request-expired", handleExpired);
    };
  }, [socket]);

  if (!data) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex justify-center py-20"><Spinner /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex items-center justify-between mb-6">
        <div className="grid grid-cols-3 gap-4 flex-1 max-w-xl">
          <SummaryStat icon={ClipboardList} label="Total requests" value={data.summary.totalRequests} />
          <SummaryStat icon={CircleDot} label="Open" value={data.summary.openRequests} tone="text-coral-500" />
          <SummaryStat icon={CheckCircle2} label="Fulfilled" value={data.summary.fulfilledRequests} tone="text-teal-700" />
        </div>
        <Button onClick={() => setModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-ink-900 mb-3">Coverage area</h2>
        <Card className="p-4">
          <CoverageMap coordinates={user?.location?.coordinates} label={user?.name} color="coral" />
          <p className="text-xs text-ink-500 mt-3">
            New requests alert every compatible, eligible donor within this 15km radius.
          </p>
        </Card>
      </section>

      {data.requests.length === 0 ? (
        <Card className="p-10 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-ink-100 flex items-center justify-center mb-3">
            <ClipboardList className="h-5 w-5 text-ink-400" />
          </div>
          <p className="text-sm text-ink-500 max-w-xs mb-4">No requests posted yet. Create one to start alerting nearby donors.</p>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.requests.map((r) => <RequestCard key={r._id} request={r} />)}
        </div>
      )}

      <NewRequestModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); loadDashboard(); }} />
    </DashboardLayout>
  );
}

function SummaryStat({ icon: Icon, label, value, tone = "text-ink-700" }) {
  return (
    <Card className="p-4">
      <Icon className={`h-4.5 w-4.5 mb-2 ${tone}`} />
      <p className="text-2xl font-display font-semibold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </Card>
  );
}