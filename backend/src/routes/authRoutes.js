import { Router } from "express";
import {
  registerDonor,
  registerHospital,
  login,
  refreshAccessToken,
  logout,
  getMe,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  donorRegisterSchema,
  hospitalRegisterSchema,
  loginSchema,
} from "../validators/schemas.js";

const router = Router();

router.post("/register/donor", authLimiter, validate(donorRegisterSchema), registerDonor);
router.post("/register/hospital", authLimiter, validate(hospitalRegisterSchema), registerHospital);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);

export default router;