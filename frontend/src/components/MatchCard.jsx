import { useState } from "react";
import { Hospital, MapPin, Clock, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { respondToMatch } from "../api/matches";

const URGENCY_VARIANT = { critical: "red", urgent: "coral", scheduled: "gray" };

/**
 * One alert card. Holds its own local "responding" state so the two
 * buttons disable independently and swap to a result badge the instant
 * the API confirms — no need to refetch the whole list for one card.
 */
export function MatchCard({ match, onResponded }) {
  const [status, setStatus] = useState(match.status);
  const [responding, setResponding] = useState(null); // "accepted" | "declined" | null

  const request = match.request;
  const hospitalName = request?.hospital?.name || "Hospital";
  const hospitalCity = request?.hospital?.city;

  const handleRespond = async (response) => {
    setResponding(response);
    try {
      await respondToMatch(match._id, response);
      setStatus(response);
      toast.success(response === "accepted" ? "Thank you for responding!" : "Response recorded");
      onResponded?.(match._id, response);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not record your response");
    } finally {
      setResponding(null);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-navy-700/10 text-navy-700 flex items-center justify-center shrink-0">
            <Hospital className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink-900 truncate">{hospitalName}</p>
            {hospitalCity && (
              <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {hospitalCity}
                {typeof match.distanceKm === "number" && ` · ${match.distanceKm} km away`}
              </p>
            )}
          </div>
        </div>
        <Badge variant={URGENCY_VARIANT[request?.urgency] || "gray"}>{request?.urgency}</Badge>
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm">
        <span className="font-semibold text-teal-700">{request?.bloodType}</span>
        <span className="text-ink-400">·</span>
        <span className="text-ink-600">{request?.unitsNeeded} unit(s) needed</span>
      </div>

      {match.createdAt && (
        <p className="text-xs text-ink-400 flex items-center gap-1 mt-2">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
        </p>
      )}

      {status === "notified" ? (
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1"
            isLoading={responding === "accepted"}
            disabled={responding !== null}
            onClick={() => handleRespond("accepted")}
          >
            <Check className="h-4 w-4" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            isLoading={responding === "declined"}
            disabled={responding !== null}
            onClick={() => handleRespond("declined")}
          >
            <X className="h-4 w-4" />
            Decline
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <Badge variant={status === "accepted" ? "teal" : "gray"}>
            {status === "accepted" ? "You accepted" : "Declined"}
          </Badge>
        </div>
      )}
    </Card>
  );
}