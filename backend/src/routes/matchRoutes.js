import { Router } from "express";
import { respondToMatch } from "../controllers/matchController.js";
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

export default router;