import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { MatchCard } from "../../components/MatchCard";
import { getMyMatches } from "../../api/donors";

export default function DonorAlerts() {
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    getMyMatches().then(({ data }) => setMatches(data)).catch(() => setMatches([]));
  }, []);

  return (
    <DashboardLayout title="My Alerts">
      {matches === null ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : matches.length === 0 ? (
        <Card className="p-10 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-ink-100 flex items-center justify-center mb-3">
            <Bell className="h-5 w-5 text-ink-400" />
          </div>
          <p className="text-sm text-ink-500 max-w-xs">
            No alerts yet. You'll see every request you've ever been matched to here.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => (
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
    </DashboardLayout>
  );
}