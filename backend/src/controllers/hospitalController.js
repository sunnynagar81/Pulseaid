import Hospital from "../models/Hospital.js";
import BloodRequest from "../models/BloodRequest.js";
import Match from "../models/Match.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiResponse.js";

export const getHospitalProfile = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) throw new ApiError(404, "Hospital not found");
  return ok(res, hospital);
});

/**
 * Live dashboard: every request this hospital has open, plus how many
 * donors have been notified vs. accepted for each — the "1 donor
 * responding" view referenced throughout the pitch deck.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ hospital: req.user._id }).sort({ createdAt: -1 });

  const requestIds = requests.map((r) => r._id);
  const matches = await Match.find({ request: { $in: requestIds } });

  const matchesByRequest = new Map();
  for (const m of matches) {
    const key = m.request.toString();
    if (!matchesByRequest.has(key)) matchesByRequest.set(key, []);
    matchesByRequest.get(key).push(m);
  }

  const enriched = requests.map((r) => {
    const reqMatches = matchesByRequest.get(r._id.toString()) || [];
    return {
      ...r.toObject(),
      stats: {
        notified: reqMatches.length,
        accepted: reqMatches.filter((m) => m.status === "accepted").length,
        declined: reqMatches.filter((m) => m.status === "declined").length,
      },
    };
  });

  const summary = {
    totalRequests: requests.length,
    openRequests: requests.filter((r) => r.status === "open").length,
    fulfilledRequests: requests.filter((r) => r.status === "fulfilled").length,
  };

  return ok(res, { requests: enriched, summary });
});


export const updateProfile = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });
  return ok(res, hospital, "Profile updated");
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const hospital = await Hospital.findById(req.user._id).select("+password");
  if (!(await hospital.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  hospital.password = newPassword;
  hospital.tokenVersion += 1;
  await hospital.save();

  return ok(res, null, "Password changed successfully");
});