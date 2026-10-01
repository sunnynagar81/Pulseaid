import { Droplet, Users, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { cn } from "../lib/cn";

const URGENCY_VARIANT = { critical: "red", urgent: "coral", scheduled: "gray" };
const STATUS_VARIANT = {
  open: "navy",
  partially_fulfilled: "coral",
  fulfilled: "teal",
  expired: "gray",
  cancelled: "gray",
};
const STATUS_LABEL = {
  open: "Open",
  partially_fulfilled: "Partially fulfilled",
  fulfilled: "Fulfilled",
  expired: "Expired",
  cancelled: "Cancelled",
};

export function RequestCard({ request, onViewDonors }) {
  const progress = Math.min(100, (request.unitsConfirmed / request.unitsNeeded) * 100);
  const stats = request.stats || { notified: 0, accepted: 0, declined: 0 };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Droplet className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-semibold text-ink-900">{request.bloodType}</p>
            <p className="text-xs text-ink-500">{request.unitsNeeded} unit(s) needed</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={URGENCY_VARIANT[request.urgency]}>{request.urgency}</Badge>
          <Badge variant={STATUS_VARIANT[request.status]}>{STATUS_LABEL[request.status]}</Badge>
        </div>
      </div>

      {request.patientInfo && (
        <p className="text-sm text-ink-600 mt-3 line-clamp-2">{request.patientInfo}</p>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-ink-500 mb-1.5">
          <span>Units confirmed</span>
          <span className="font-medium text-ink-700">
            {request.unitsConfirmed} / {request.unitsNeeded}
          </span>
        </div>
        <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              progress >= 100 ? "bg-teal-600" : "bg-coral-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-ink-100 text-xs">
        <StatPill icon={Users} value={stats.notified} label="notified" />
        <StatPill icon={CheckCircle2} value={stats.accepted} label="accepted" tone="text-teal-700" />
        <StatPill icon={XCircle} value={stats.declined} label="declined" tone="text-ink-400" />
      </div>

      {request.createdAt && (
        <p className="text-xs text-ink-400 flex items-center gap-1 mt-3">
          <Clock className="h-3 w-3" />
          Posted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </p>
      )}

      <Button
        size="sm"
        variant="outline"
        className="w-full mt-4"
        onClick={() => onViewDonors?.(request._id)}
      >
        <Eye className="h-4 w-4" />
        View Donors
      </Button>
    </Card>
  );
}

function StatPill({ icon: Icon, value, label, tone = "text-ink-500" }) {
  return (
    <span className={cn("flex items-center gap-1", tone)}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-semibold">{value}</span>
      {label}
    </span>
  );
}