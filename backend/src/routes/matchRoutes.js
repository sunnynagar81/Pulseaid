import { Router } from "express";
import { respondToMatch, confirmDonation } from "../controllers/matchController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { respondToMatchSchema } from "../validators/schemas.js";

const router = Router();

router.patch(
  "/:id/respond",
  authMiddleware,
  authorizeRoles("donor"),
  validate(respondToMatchSchema),
  respondToMatch
);

router.patch(
  "/:id/confirm",
  authMiddleware,
  authorizeRoles("hospital"),
  confirmDonation
);

export default router;