import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Donor from "../models/Donor.js";
import Hospital from "../models/Hospital.js";

const ROLE_MODELS = { donor: Donor, hospital: Hospital };

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || extractBearerToken(req);

  if (!token) {
    throw new ApiError(401, "Not authenticated — no token provided");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const Model = ROLE_MODELS[payload.role];
  if (!Model) throw new ApiError(401, "Unknown role in token");

  const user = await Model.findById(payload.id);
  if (!user) throw new ApiError(401, "User no longer exists");

  req.user = user;
  req.role = payload.role;
  next();
});

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.role)) {
    throw new ApiError(403, `Role '${req.role}' is not permitted to access this resource`);
  }
  next();
};

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
}