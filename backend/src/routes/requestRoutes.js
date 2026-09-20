import { Router } from "express";
import {
  createRequest,
  getRequestMatches,
  getOpenRequests,
} from "../controllers/requestController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createRequestLimiter } from "../middleware/rateLimiter.js";
import { createRequestSchema } from "../validators/schemas.js";

const router = Router();

router.get("/", authMiddleware, getOpenRequests);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("hospital"),
  createRequestLimiter,
  validate(createRequestSchema),
  createRequest
);

router.get("/:id/matches", authMiddleware, authorizeRoles("hospital"), getRequestMatches);

export default router;