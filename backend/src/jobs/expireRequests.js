import cron from "node-cron";
import BloodRequest from "../models/BloodRequest.js";
import { getIO } from "../sockets/socketHandler.js";

/**
 * Runs every 15 minutes. Any request still "open" or "partially_fulfilled"
 * past its expiresAt is marked "expired" so hospital dashboards and donor
 * alert lists don't accumulate stale, unfillable requests.
 *
 * (Donor 90-day eligibility doesn't need its own job — Donor.isEligible()
 * computes it live from lastDonationDate on every read, so it's always
 * correct without a background pass.)
 */
export function startCronJobs() {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = new Date();
      const staleRequests = await BloodRequest.find({
        status: { $in: ["open", "partially_fulfilled"] },
        expiresAt: { $lte: now },
      });

      if (staleRequests.length === 0) return;

      const ids = staleRequests.map((r) => r._id);
      await BloodRequest.updateMany({ _id: { $in: ids } }, { status: "expired" });

      console.log(`[cron] expired ${staleRequests.length} stale blood request(s)`);

      const io = getIO();
      staleRequests.forEach((r) => {
        io.to(`hospital:${r.hospital}`).emit("request-expired", { requestId: r._id });
      });
    } catch (err) {
      console.error("[cron] request-expiry job failed:", err.message);
    }
  });

  console.log("[cron] request-expiry job scheduled (every 15 min)");
}