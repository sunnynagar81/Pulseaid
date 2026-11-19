import { useEffect, useState } from "react";
import { Hospital, MapPin, Clock, Check, X, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { respondToMatch } from "../api/matches";
import { motion } from "framer-motion";

const URGENCY_VARIANT = { critical: "red", urgent: "coral", scheduled: "gray" };
const STATUS_LABEL = { accepted: "You accepted", declined: "Declined", completed: "Donation confirmed" };

export function MatchCard({ match, onResponded }) {
  const [status, setStatus] = useState(match.status);
  const [responding, setResponding] = useState(null);

  // Keep local status in sync when the parent updates the match live
  // (e.g. the hospital confirms the donation over the socket).
  useEffect(() => {
    setStatus(match.status);
  }, [match.status]);

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="p-5" hoverable>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-navy-700/10 text-navy-700 flex items-center justify-center shrink-0">
              <Hospital className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-ink-900 truncate">{hospitalName}</p>
              {hospitalCity && (
                <p className="text-xs text-ink-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {hospitalCity}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={URGENCY_VARIANT[request.urgency]} className="uppercase text-xs font-medium">
              {request.urgency}
            </Badge>
            <Badge variant="gray" className="uppercase text-xs font-medium">
              {request.bloodType}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-500">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRespond("declined")}
                disabled={responding === "declined"}
              >
                {responding === "declined" ? <X className="h-4 w-4" /> : "Decline"}
              </Button>
            )}
            {status === "pending" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleRespond("accepted")}
                disabled={responding === "accepted"}
              >
                {responding === "accepted" ? <Check className="h-4 w-4" /> : "Accept"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}