import dns from "dns";
import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initGraphDriver, closeGraphDriver } from "./config/graph.js";
import { initSocket } from "./sockets/socketHandler.js";
import { startCronJobs } from "./jobs/expireRequests.js";


dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB();
  initGraphDriver(); // no-op with a warning if NEO4J_URI isn't set

  const httpServer = http.createServer(app);
  initSocket(httpServer); // must run before startCronJobs (it calls getIO())
  startCronJobs();

  httpServer.listen(PORT, () => {
    console.log(`[server] backend running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("\n[server] Shutting down gracefully...");
  await closeGraphDriver();
  process.exit(0);
});