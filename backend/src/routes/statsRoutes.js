import { Router } from "express";
import { getPublicStats } from "../controllers/statsController.js";

const router = Router();

// Intentionally no authMiddleware — this is public data for the
// landing page, visible before anyone logs in.
router.get("/public", getPublicStats);

export default router;