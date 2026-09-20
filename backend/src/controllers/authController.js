import jwt from "jsonwebtoken";
import Donor from "../models/Donor.js";
import Hospital from "../models/Hospital.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiResponse.js";
import { created, ok } from "../utils/apiResponse.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "../utils/generateTokens.js";
import { upsertDonorNode } from "../services/graphProximity.js";

const ROLE_MODELS = { donor: Donor, hospital: Hospital };

function toGeoPoint(coordinates) {
  return { type: "Point", coordinates };
}

export const registerDonor = asyncHandler(async (req, res) => {
  const { name, email, phone, password, bloodType, coordinates, city } = req.body;

  const existing = await Donor.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const donor = await Donor.create({
    name,
    email,
    phone,
    password,
    bloodType,
    city,
    location: toGeoPoint(coordinates),
  });

  await upsertDonorNode(donor); // keep graph layer in sync, no-op if disabled

  return created(res, sanitize(donor), "Donor registered successfully");
});

export const registerHospital = asyncHandler(async (req, res) => {
  const { name, email, phone, password, registrationNumber, address, coordinates, city } = req.body;

  const existing = await Hospital.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const hospital = await Hospital.create({
    name,
    email,
    phone,
    password,
    registrationNumber,
    address,
    city,
    location: toGeoPoint(coordinates),
  });

  return created(res, sanitize(hospital), "Hospital registered successfully — pending verification");
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  const Model = ROLE_MODELS[role];
  const user = await Model.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const userWithRole = { ...user.toObject(), role: user.role };
  const accessToken = generateAccessToken(userWithRole);
  const refreshToken = generateRefreshToken(user);

  setAuthCookies(res, accessToken, refreshToken);

  return ok(res, { user: sanitize(user), accessToken }, "Logged in successfully");
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Refresh token doesn't carry role, so check both collections.
  const donor = await Donor.findById(payload.id);
  const user = donor || (await Hospital.findById(payload.id));
  if (!user) throw new ApiError(401, "User no longer exists");
  if ((user.tokenVersion || 0) !== payload.tokenVersion) {
    throw new ApiError(401, "Refresh token has been revoked");
  }

  const role = donor ? "donor" : "hospital";
  const accessToken = generateAccessToken({ ...user.toObject(), role });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  return ok(res, { accessToken }, "Access token refreshed");
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  return ok(res, null, "Logged out successfully");
});

export const getMe = asyncHandler(async (req, res) => {
  return ok(res, { ...sanitize(req.user), role: req.role }, "Current user fetched");
});

function sanitize(userDoc) {
  const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete obj.password;
  delete obj.tokenVersion;
  return obj;
}