import { Router } from "express";
import {
  getDonorProfile,
  updateAvailability,
  updateLocation,
  getEligibility,
  recordDonation,
  getMyMatches,
  updateProfile,
  changePassword,
} from "../controllers/donorController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { updateDonorProfileSchema, changePasswordSchema } from "../validators/schemas.js";

const router = Router();

router.use(authMiddleware, authorizeRoles("donor"));

router.get("/me/matches", getMyMatches);
router.get("/me/eligibility", getEligibility);
router.patch("/me/availability", updateAvailability);
router.patch("/me/location", updateLocation);
router.patch("/me", validate(updateDonorProfileSchema), updateProfile);
router.patch("/me/password", validate(changePasswordSchema), changePassword);
router.post("/me/donations", recordDonation);
router.get("/:id", getDonorProfile);

export default router;