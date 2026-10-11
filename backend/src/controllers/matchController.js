import mongoose from "mongoose";
import Match from "../models/Match.js";
import BloodRequest from "../models/BloodRequest.js";
import Donor from "../models/Donor.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ok } from "../utils/apiResponse.js";
import { getIO } from "../sockets/socketHandler.js";

/**
 * Wrapped in a transaction: a donor's match status and the parent
 * request's unitsConfirmed/status must move together. Without this,
 * two donors accepting the last unit at the same instant could both
 * read unitsConfirmed before either write lands, over-confirming units.
 */
export const respondToMatch = asyncHandler(async (req, res) => {
  const { response } = req.body; // "accepted" | "declined"

  const session = await mongoose.startSession();
  let updatedMatch, updatedRequest;

  try {
    await session.withTransaction(async () => {
      const match = await Match.findById(req.params.id).session(session);
      if (!match) throw new ApiError(404, "Match not found");

      if (match.donor.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "This alert does not belong to you");
      }
      if (match.status !== "notified") {
        throw new ApiError(409, `This match has already been ${match.status}`);
      }

      match.status = response;
      match.respondedAt = new Date();
      await match.save({ session });

      const bloodRequest = await BloodRequest.findById(match.request).session(session);

      if (response === "accepted") {
        bloodRequest.unitsConfirmed += 1;
        bloodRequest.status =
          bloodRequest.unitsConfirmed >= bloodRequest.unitsNeeded
            ? "fulfilled"
            : "partially_fulfilled";
        await bloodRequest.save({ session });

        // A donor who has accepted is now committed to this request and
        // should not be pulled into a new, unrelated match while that
        // commitment is still open. isAvailable is what the matching
        // engine already filters on (both the Mongo geo query and the
        // Neo4j Cypher query), so pausing it here is enough to stop
        // further alerts without touching the matching logic itself.
        // The donor can flip themselves back to "Available" from their
        // dashboard whenever they're free again.
        await Donor.findByIdAndUpdate(req.user._id, { isAvailable: false }, { session });
      }

      updatedMatch = match;
      updatedRequest = bloodRequest;
    });
  } finally {
    await session.endSession();
  }

  const io = getIO();
  io.to(`hospital:${updatedRequest.hospital}`).emit("match-updated", {
    requestId: updatedRequest._id,
    matchId: updatedMatch._id,
    status: updatedMatch.status,
    unitsConfirmed: updatedRequest.unitsConfirmed,
    requestStatus: updatedRequest.status,
  });

  return ok(res, updatedMatch, `Response recorded: ${response}`);
});

// Hospital-only: confirms a donor's accepted match actually resulted in
// a real donation. This is intentionally separate from respondToMatch —
// a donor accepting means "I'm willing," a hospital confirming means
// "this genuinely happened." Only the hospital's confirmation resets
// the donor's 90-day eligibility clock and their public donation count,
// so the platform's impact numbers stay honest.
//
// It also now appends a verified donationHistory record and flips the
// donor into "priority" status — this is the feature that lets a
// hospital later look up this donor (by Aadhaar) and see a real,
// hospital-confirmed donation record, so the donor can be prioritized
// if they themselves ever need blood in future.
export const confirmDonation = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let updatedMatch, donorId, newTotalDonations;

  try {
    await session.withTransaction(async () => {
      const match = await Match.findById(req.params.id).session(session);
      if (!match) throw new ApiError(404, "Match not found");

      const bloodRequest = await BloodRequest.findById(match.request).session(session);
      if (!bloodRequest || bloodRequest.hospital.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "This match does not belong to one of your requests");
      }

      if (match.status !== "accepted") {
        throw new ApiError(409, `Cannot confirm a match that is currently "${match.status}"`);
      }

      match.status = "completed";
      match.completedAt = new Date();
      await match.save({ session });

      const donationRecord = {
        hospital: req.user._id,
        hospitalName: req.user.name,
        date: new Date(),
        bloodType: bloodRequest.bloodType,
        units: 1,
        badge: "Verified Donor",
      };

      const donor = await Donor.findByIdAndUpdate(
        match.donor,
        {
          lastDonationDate: new Date(),
          isAvailable: true,
          $inc: { totalDonations: 1, priorityScore: 1 },
          $push: { donationHistory: donationRecord },
          $set: { isPriorityDonor: true },
        },
        { new: true, session }
      );

      updatedMatch = match;
      donorId = donor._id;
      newTotalDonations = donor.totalDonations;
    });
  } finally {
    await session.endSession();
  }

  // Notify the donor live — this is the actual "you helped save lives"
  // moment, coming from the hospital's confirmation, not self-reported.
  const io = getIO();
  io.to(`donor:${donorId}`).emit("donation-confirmed", {
    matchId: updatedMatch._id,
    hospitalName: req.user.name,
    totalDonations: newTotalDonations,
    livesImpacted: newTotalDonations * 3,
  });

  return ok(res, updatedMatch, "Donation confirmed");
});