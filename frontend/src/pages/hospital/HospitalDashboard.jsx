import { useEffect, useState } from "react";
import { Plus, ClipboardList, CircleDot, CheckCircle2, Search, Award, Phone, Droplet } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { RequestCard } from "../../components/RequestCard";
import { NewRequestModal } from "../../components/NewRequestModal";
import { RequestMatchesModal } from "../../components/RequestMatchesModal";
import { CoverageMap } from "../../components/CoverageMap";
import { useSocket } from "../../contexts/SocketContext";
import { getDashboard, verifyDonorByAadhaar } from "../../api/hospitals";
import { useAuthStore } from "../../store/authStore";
import { SkeletonRequestCard, SkeletonStatCard } from "../../components/ui/Skeleton";

export default function HospitalDashboard() {
  const { socket } = useSocket();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingRequestId, setViewingRequestId] = useState(null);

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
        <div className="grid grid-cols-3 gap-4 max-w-xl mb-8">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonRequestCard />
          <SkeletonRequestCard />
          <SkeletonRequestCard />
        </div>
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
        <h2 className="text-base font-semibold text-ink-900 mb-3">Verify a donor</h2>
        <VerifyDonorCard />
      </section>

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
          {data.requests.map((r) => (
            <RequestCard key={r._id} request={r} onViewDonors={setViewingRequestId} />
          ))}
        </div>
      )}

      <NewRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          loadDashboard();
        }}
      />

      <RequestMatchesModal
        open={!!viewingRequestId}
        requestId={viewingRequestId}
        onClose={() => setViewingRequestId(null)}
      />
    </DashboardLayout>
  );
}

function VerifyDonorCard() {
  const [aadhaar, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleaned = aadhaar.replace(/\s+/g, "");
    if (!/^\d{12}$/.test(cleaned)) {
      toast.error("Enter a valid 12-digit Aadhaar number");
      return;
    }

    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const { data } = await verifyDonorByAadhaar(cleaned);
      setResult(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(err.response?.data?.message || "Could not verify donor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5">
      <form onSubmit={handleSearch} className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label="Donor Aadhaar number"
            icon={Search}
            placeholder="XXXX XXXX XXXX"
            maxLength={14}
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
          />
        </div>
        <Button type="submit" isLoading={loading} className="shrink-0">
          Verify
        </Button>
      </form>

      {notFound && (
        <p className="text-sm text-ink-500 mt-4">No donor found with this Aadhaar number.</p>
      )}

      {result && (
        <div className="mt-5 pt-5 border-t border-ink-100">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-base font-semibold text-ink-900">{result.name}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-ink-500">
                <span className="flex items-center gap-1">
                  <Droplet className="h-3.5 w-3.5 text-teal-700" /> {result.bloodType}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {result.phone}
                </span>
                {result.city && <span>{result.city}</span>}
              </div>
            </div>
            {result.isPriorityDonor && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 shrink-0">
                <Award className="h-3.5 w-3.5" />
                Verified Priority Donor
              </span>
            )}
          </div>

          {result.donationHistory?.length > 0 ? (
            <div className="divide-y divide-ink-100 border border-ink-100 rounded-lg overflow-hidden">
              {result.donationHistory
                .slice()
                .reverse()
                .map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-ink-900">{record.hospitalName}</span>
                    <span className="text-ink-500">
                      {format(new Date(record.date), "d MMM yyyy")} · {record.units} unit{record.units > 1 ? "s" : ""} · {record.bloodType}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">No donation history recorded yet.</p>
          )}
        </div>
      )}
    </Card>
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