import Donor from "../models/Donor.js";
import Match from "../models/Match.js";
import { getCompatibleDonorTypes } from "./bloodCompatibility.js";
import { findNearestDonorIds } from "./graphProximity.js";

const DEFAULT_RADIUS_KM = 500;
const MAX_DONORS_PER_REQUEST = 25;

// Donors within this many km of each other are treated as "equally near"
// for ranking purposes. Within a band, a verified priority donor is moved
// ahead of a non-priority donor — but a priority donor several bands
// further away never jumps ahead of someone genuinely closer. Distance
// stays the dominant factor; priority only breaks ties.
const PRIORITY_DISTANCE_BAND_KM = 2;

/**
 * Runs the four-stage filter described in the project deck:
 *   1. Blood compatibility  2. 90-day eligibility
 *   3. Proximity (graph if available, else Mongo geo)  4. Final ranking
 *
 * Returns the list of Donor documents chosen for this request, in the
 * order they should be alerted (closest / soonest-available first, with
 * verified priority donors ranked ahead of others at comparable distance).
 */
export async function findMatchingDonors(bloodRequest) {
  const compatibleTypes = getCompatibleDonorTypes(bloodRequest.bloodType);
  const [lng, lat] = bloodRequest.location.coordinates;

  // Try the graph first — it already applies bloodType + isAvailable filters.
  const graphResult = await findNearestDonorIds({
    lat,
    lng,
    bloodType: { $in: compatibleTypes }, // note: Cypher query in graphProximity
    // uses a single bloodType; for multi-type compatibility the Mongo
    // fallback below is the source of truth in the current version.
    radiusKm: DEFAULT_RADIUS_KM,
    limit: MAX_DONORS_PER_REQUEST,
  }).catch(() => null);

  let candidateDonors;

  if (graphResult && graphResult.length > 0) {
    const ids = graphResult.map((r) => r.donorId);
    const donors = await Donor.find({ _id: { $in: ids } });
    // Preserve graph-ranked order and attach precomputed distance.
    const distanceById = new Map(graphResult.map((r) => [r.donorId, r.distanceKm]));
    candidateDonors = donors
      .map((d) => ({ donor: d, distanceKm: distanceById.get(d._id.toString()) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  } else {
    // Fallback: MongoDB geospatial $near, sorted nearest-first by design.
    const donors = await Donor.find({
      bloodType: { $in: compatibleTypes },
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: DEFAULT_RADIUS_KM * 1000, // meters
        },
      },
    }).limit(MAX_DONORS_PER_REQUEST);

    candidateDonors = donors.map((d) => ({
      donor: d,
      distanceKm: haversineKm([lng, lat], d.location.coordinates),
    }));
  }

  // Eligibility filter (90-day gap) runs last since it's the cheapest check
  // and keeps the geo query itself simple.
  const eligible = candidateDonors.filter(({ donor }) => donor.isEligible());

  // Final ranking: nearest-first stays dominant, but within the same
  // distance band a verified priority donor (hospital-confirmed donation
  // history) is bumped ahead of a non-priority donor at that same band.
  const ranked = rankByPriority(eligible);

  console.log("[match-debug]", {
    requestBloodType: bloodRequest.bloodType,
    compatibleTypes,
    hospitalCoords: [lng, lat],
    candidatesFound: candidateDonors.length,
    candidateDonors: ranked.map((c) => ({
      id: c.donor._id.toString(),
      bloodType: c.donor.bloodType,
      coords: c.donor.location.coordinates,
      distanceKm: c.distanceKm,
      isAvailable: c.donor.isAvailable,
      isPriorityDonor: c.donor.isPriorityDonor,
    })),
  });

  return ranked; // [{ donor, distanceKm }], nearest-first with priority tie-break
}

function rankByPriority(candidates) {
  return candidates.slice().sort((a, b) => {
    const bandA = Math.floor(a.distanceKm / PRIORITY_DISTANCE_BAND_KM);
    const bandB = Math.floor(b.distanceKm / PRIORITY_DISTANCE_BAND_KM);
    if (bandA !== bandB) return bandA - bandB;

    const priorityA = a.donor.isPriorityDonor ? 1 : 0;
    const priorityB = b.donor.isPriorityDonor ? 1 : 0;
    if (priorityA !== priorityB) return priorityB - priorityA;

    return a.distanceKm - b.distanceKm;
  });
}

/**
 * Creates Match documents for the given donors and returns them, ready
 * to be broadcast over Socket.io by the caller (requestController.js).
 */
export async function createMatchesForRequest(bloodRequest, matchedDonors) {
  const docs = matchedDonors.map(({ donor, distanceKm }) => ({
    request: bloodRequest._id,
    donor: donor._id,
    distanceKm: Math.round(distanceKm * 10) / 10,
  }));

  if (docs.length === 0) return [];

  const created = await Match.insertMany(docs, { ordered: false }).catch((err) => {
    // Duplicate-key errors (donor already matched to this request) are
    // expected on retries; anything else should surface.
    if (err.code !== 11000) throw err;
    return err.insertedDocs || [];
  });

  return created;
}

function haversineKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}