import BloodRequest from "../models/BloodRequest.js";
import Hospital from "../models/Hospital.js";
import Match from "../models/Match.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, created, ok } from "../utils/apiResponse.js";
import { findMatchingDonors, createMatchesForRequest } from "../services/matchingEngine.js";
import { getIO } from "../sockets/socketHandler.js";

const REQUEST_TTL_HOURS = 12;

export const createRequest = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.user._id);
  if (!hospital) throw new ApiError(404, "Hospital not found");

  const { patientInfo, bloodType, unitsNeeded, urgency } = req.body;

  const bloodRequest = await BloodRequest.create({
    hospital: hospital._id,
    patientInfo,
    bloodType,
    unitsNeeded,
    urgency,
    location: hospital.location,
    expiresAt: new Date(Date.now() + REQUEST_TTL_HOURS * 60 * 60 * 1000),
  });

  // Run the matching engine and push live alerts immediately — this is
  // the "push, not pull" behaviour the whole project is built around.
  const matchedDonors = await findMatchingDonors(bloodRequest);
  const matches = await createMatchesForRequest(bloodRequest, matchedDonors);

  const io = getIO();
  matches.forEach((match) => {
    io.to(`donor:${match.donor}`).emit("new-alert", {
      matchId: match._id,
      requestId: bloodRequest._id,
      hospitalName: hospital.name,
      bloodType: bloodRequest.bloodType,
      unitsNeeded: bloodRequest.unitsNeeded,
      urgency: bloodRequest.urgency,
      distanceKm: match.distanceKm,
    });
  });

  io.to(`hospital:${hospital._id}`).emit("request-created", {
    requestId: bloodRequest._id,
    donorsNotified: matches.length,
  });

  return created(
    res,
    { request: bloodRequest, donorsNotified: matches.length },
    matches.length > 0
      ? `Request posted — ${matches.length} matching donor(s) notified`
      : "Request posted — no matching donors found nearby yet"
  );
});

export const getRequestMatches = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.findById(req.params.id);
  if (!bloodRequest) throw new ApiError(404, "Request not found");

  if (bloodRequest.hospital.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not own this request");
  }

  const matches = await Match.find({ request: bloodRequest._id })
    .populate("donor", "name phone bloodType");

  return ok(res, matches);
});

export const getOpenRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ status: "open" })
    .populate("hospital", "name city address")
    .sort({ urgency: 1, createdAt: -1 });

  return ok(res, requests);
});