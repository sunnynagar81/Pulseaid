import { Router } from "express";
import {
  getHospitalProfile,
  getDashboard,
  updateProfile,
  changePassword,
  verifyDonorByAadhaar,
} from "../controllers/hospitalController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  updateHospitalProfileSchema,
  changePasswordSchema,
  aadhaarLookupSchema,
} from "../validators/schemas.js";

const router = Router();

router.use(authMiddleware, authorizeRoles("hospital"));

router.get("/me/dashboard", getDashboard);
router.patch("/me", validate(updateHospitalProfileSchema), updateProfile);
router.patch("/me/password", validate(changePasswordSchema), changePassword);
router.post("/verify-donor", validate(aadhaarLookupSchema), verifyDonorByAadhaar);
router.get("/:id", getHospitalProfile);

export default router;