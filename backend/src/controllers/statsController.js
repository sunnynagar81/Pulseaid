import Donor from "../models/Donor.js";
import Hospital from "../models/Hospital.js";
import BloodRequest from "../models/BloodRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

/**
 * Public, unauthenticated stats for the landing page. Deliberately
 * cheap: four simple counts/aggregates, no per-user data, safe to
 * expose without a login. If any single query fails, the whole
 * endpoint still responds with zeros for that field rather than a
 * 500 — a landing page showing "0" is fine, a landing page crashing
 * because of this optional widget is not.
 */
export const getPublicStats = asyncHandler(async (req, res) => {
  const [totalDonors, totalHospitals, fulfilledRequests, donationAgg] = await Promise.all([
    Donor.countDocuments().catch(() => 0),
    Hospital.countDocuments().catch(() => 0),
    BloodRequest.countDocuments({ status: "fulfilled" }).catch(() => 0),
    Donor.aggregate([{ $group: { _id: null, total: { $sum: "$totalDonations" } } }]).catch(() => []),
  ]);

  const totalDonations = donationAgg[0]?.total || 0;

  // A single blood donation can be separated into red cells, plasma,
  // and platelets — helping up to 3 different patients. This is a
  // widely cited, medically accurate figure (used by Red Cross and
  // similar blood-donation awareness campaigns), not an invented stat.
  const livesImpacted = totalDonations * 3;

  return ok(res, {
    totalDonors,
    totalHospitals,
    fulfilledRequests,
    totalDonations,
    livesImpacted,
  });
});