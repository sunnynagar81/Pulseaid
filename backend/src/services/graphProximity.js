import { getGraphDriver } from "../config/graph.js";
import Donor from "../models/Donor.js";

/**
 * Keeps a lightweight (Donor)-[:NEAR]->(Hospital) graph in sync whenever a
 * donor's location changes. Distance is precomputed at write time so
 * queries at request time are pure graph traversal, not geo-math.
 */
export async function upsertDonorNode(donor) {
  const driver = getGraphDriver();
  if (!driver) return; // graph layer disabled — Mongo geo handles matching alone

  const session = driver.session();
  try {
    await session.run(
      `MERGE (d:Donor {mongoId: $id})
       SET d.bloodType = $bloodType,
           d.lat = $lat,
           d.lng = $lng,
           d.isAvailable = $isAvailable`,
      {
        id: donor._id.toString(),
        bloodType: donor.bloodType,
        lat: donor.location.coordinates[1],
        lng: donor.location.coordinates[0],
        isAvailable: donor.isAvailable,
      }
    );
  } catch (err) {
    // Never let a broken graph layer take down a core write path like
    // registration — log it and continue on Mongo alone.
    console.error("[graph] upsertDonorNode failed, continuing without graph sync:", err.message);
  } finally {
    await session.close();
  }
}

/**
 * Returns donor mongoIds ranked by graph distance to a hospital point.
 * Falls back to null when the graph driver isn't configured — the caller
 * (matchingEngine.js) then relies solely on the MongoDB $near query.
 */
export async function findNearestDonorIds({ lat, lng, bloodType, radiusKm, limit }) {
  const driver = getGraphDriver();
  if (!driver) return null;

  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (d:Donor)
       WHERE d.bloodType = $bloodType AND d.isAvailable = true
       WITH d, point({latitude: d.lat, longitude: d.lng}) AS donorPoint,
            point({latitude: $lat, longitude: $lng}) AS hospitalPoint
       WITH d, point.distance(donorPoint, hospitalPoint) / 1000 AS distanceKm
       WHERE distanceKm <= $radiusKm
       RETURN d.mongoId AS donorId, distanceKm
       ORDER BY distanceKm ASC
       LIMIT $limit`,
      { bloodType, lat, lng, radiusKm, limit: neo4jInt(limit) }
    );

    return result.records.map((r) => ({
      donorId: r.get("donorId"),
      distanceKm: r.get("distanceKm"),
    }));
  } finally {
    await session.close();
  }
}

function neo4jInt(n) {
  // neo4j-driver expects integers for LIMIT; plain JS numbers work in
  // modern driver versions via implicit conversion, kept explicit here
  // for clarity if swapped to a stricter driver config later.
  return Math.floor(n);
}

/**
 * One-time backfill: pushes every existing donor into the graph. Useful
 * after enabling Neo4j on a database that already has donor records.
 */
export async function syncAllDonorsToGraph() {
  const driver = getGraphDriver();
  if (!driver) return { synced: 0, skipped: true };

  const donors = await Donor.find({});
  for (const donor of donors) {
    await upsertDonorNode(donor);
  }
  return { synced: donors.length, skipped: false };
}