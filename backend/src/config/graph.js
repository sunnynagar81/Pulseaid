import neo4j from "neo4j-driver";

let driver = null;

/**
 * Neo4j powers the donor <-> hospital proximity graph used as a secondary
 * ranking signal in the matching engine. It is intentionally optional:
 * if NEO4J_URI is not configured, matchingEngine.js falls back to pure
 * MongoDB geospatial queries so the API still runs on a bare Mongo setup.
 */
export function initGraphDriver() {
  if (!process.env.NEO4J_URI) {
    console.warn("[graph] NEO4J_URI not set — graph proximity ranking disabled, using Mongo geo fallback only");
    return null;
  }

  driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );

  console.log("[graph] Neo4j driver initialized");
  return driver;
}

export function getGraphDriver() {
  return driver;
}

export async function closeGraphDriver() {
  if (driver) await driver.close();
}