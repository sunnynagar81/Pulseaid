import { useEffect, useState } from "react";
import { Plus, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { RequestCard } from "../../components/RequestCard";
import { NewRequestModal } from "../../components/NewRequestModal";
import { RequestMatchesModal } from "../../components/RequestMatchesModal";
import { useSocket } from "../../contexts/SocketContext";
import { getDashboard } from "../../api/hospitals";
import { SkeletonRequestCard } from "../../components/ui/Skeleton";

export default function HospitalRequests() {
  const { socket } = useSocket();
  const [requests, setRequests] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingRequestId, setViewingRequestId] = useState(null);

  const load = () => getDashboard().then(({ data }) => setRequests(data.requests));

  useEffect(() => {
    load().catch(() => toast.error("Could not load requests"));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMatchUpdated = (payload) => {
      setRequests((prev) =>
        prev?.map((r) =>
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
        )
      );
    };

    socket.on("match-updated", handleMatchUpdated);
    return () => socket.off("match-updated", handleMatchUpdated);
  }, [socket]);

  return (
    <DashboardLayout title="Requests">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

            {requests === null ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonRequestCard />
          <SkeletonRequestCard />
          <SkeletonRequestCard />
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-10 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-ink-100 flex items-center justify-center mb-3">
            <ClipboardList className="h-5 w-5 text-ink-400" />
          </div>
          <p className="text-sm text-ink-500 max-w-xs mb-4">No requests posted yet.</p>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((r) => (
            <RequestCard key={r._id} request={r} onViewDonors={setViewingRequestId} />
          ))}
        </div>
      )}

      <NewRequestModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); load(); }} />

      <RequestMatchesModal
        open={!!viewingRequestId}
        requestId={viewingRequestId}
        onClose={() => setViewingRequestId(null)}
      />
    </DashboardLayout>
  );
}