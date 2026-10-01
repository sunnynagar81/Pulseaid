import { useEffect, useState } from "react";
import { Phone, Droplet, CheckCircle2, Clock, XCircle, Award } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "./ui/Modal";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import { getRequestMatches } from "../api/requests";
import { confirmDonation } from "../api/matches";

const STATUS_VARIANT = { notified: "gray", accepted: "coral", completed: "teal", declined: "gray" };
const STATUS_LABEL = { notified: "Notified", accepted: "Accepted — awaiting donation", completed: "Donation confirmed", declined: "Declined" };

/**
 * Hospital-side view of who has responded to a specific request. This
 * is the piece that was missing before — the matching engine and the
 * accept/decline flow existed, but a hospital had no screen to actually
 * see individual donors or confirm a real donation happened.
 */
export function RequestMatchesModal({ open, onClose, requestId }) {
  const [matches, setMatches] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    if (!open || !requestId) return;
    setMatches(null);
    getRequestMatches(requestId)
      .then(({ data }) => setMatches(data))
      .catch(() => {
        toast.error("Could not load donors for this request");
        setMatches([]);
      });
  }, [open, requestId]);

  const handleConfirm = async (matchId) => {
    setConfirmingId(matchId);
    try {
      await confirmDonation(matchId);
      toast.success("Donation confirmed — donor notified");
      setMatches((prev) =>
        prev.map((m) => (m._id === matchId ? { ...m, status: "completed" } : m))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not confirm donation");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Donors for this request">
      {matches === null ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : matches.length === 0 ? (
        <p className="text-sm text-ink-500 text-center py-6">No donors have been matched to this request yet.</p>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m._id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-ink-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-navy-700 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                  {m.donor?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{m.donor?.name}</p>
                  <p className="text-xs text-ink-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Droplet className="h-3 w-3" />{m.donor?.bloodType}</span>
                    {m.donor?.phone && (
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{m.donor.phone}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_VARIANT[m.status]}>{STATUS_LABEL[m.status]}</Badge>
                {m.status === "accepted" && (
                  <Button
                    size="sm"
                    isLoading={confirmingId === m._id}
                    disabled={confirmingId !== null}
                    onClick={() => handleConfirm(m._id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm
                  </Button>
                )}
                {m.status === "completed" && <Award className="h-4 w-4 text-teal-600" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}