import Donor from "../models/Donor.js";
import Match from "../models/Match.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiResponse.js";
import { upsertDonorNode } from "../services/graphProximity.js";

export const getDonorProfile = asyncHandler(async (req, res) => {
  const donor = await Donor.findById(req.params.id);
  if (!donor) throw new ApiError(404, "Donor not found");
  return ok(res, donor);
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const donor = await Donor.findByIdAndUpdate(
    req.user._id,
    { isAvailable: req.body.isAvailable },
    { new: true }
  );
  await upsertDonorNode(donor);
  return ok(res, donor, "Availability updated");
});

export const updateLocation = asyncHandler(async (req, res) => {
  const { coordinates } = req.body;
  const donor = await Donor.findByIdAndUpdate(
    req.user._id,
    { location: { type: "Point", coordinates } },
    { new: true }
  );
  await upsertDonorNode(donor);
  return ok(res, donor, "Location updated");
});

export const getEligibility = asyncHandler(async (req, res) => {
  const donor = req.params.id ? await Donor.findById(req.params.id) : req.user;
  if (!donor) throw new ApiError(404, "Donor not found");

  return ok(res, {
    isEligible: donor.isEligible(),
    lastDonationDate: donor.lastDonationDate,
    nextEligibleDate: donor.nextEligibleDate(),
  });
});

// A donor confirming they actually donated after accepting a match —
// this is what resets the 90-day clock, not just accepting the alert.
export const recordDonation = asyncHandler(async (req, res) => {
  const donor = await Donor.findByIdAndUpdate(
    req.user._id,
    { lastDonationDate: new Date(), isAvailable: true, $inc: { totalDonations: 1 } },
    { new: true }
  );
  return ok(res, donor, "Donation recorded — thank you!");
});


export const getMyMatches = asyncHandler(async (req, res) => {
  const matches = await Match.find({ donor: req.user._id })
    .populate({
      path: "request",
      populate: { path: "hospital", select: "name city address" },
    })
    .sort({ createdAt: -1 });

  return ok(res, matches);
});

// Only name/phone/city are editable here — email and bloodType are
// intentionally excluded: email is the login identifier (changing it
// safely needs re-verification, out of scope for now) and bloodType
// changing after registration is a correctness/safety concern, not a
// simple profile edit.
export const updateProfile = asyncHandler(async (req, res) => {
  const donor = await Donor.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });
  return ok(res, donor, "Profile updated");
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const donor = await Donor.findById(req.user._id).select("+password");
  if (!(await donor.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  donor.password = newPassword;
  donor.tokenVersion += 1;
  await donor.save();

  return ok(res, null, "Password changed successfully");
});