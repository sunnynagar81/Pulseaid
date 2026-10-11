import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// One donation record, added automatically every time a hospital
// confirms this donor actually donated (see matchController.confirmDonation).
const donationHistorySchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    hospitalName: { type: String, required: true }, // denormalized, so history displays fast with no extra lookup
    date: { type: Date, required: true, default: Date.now },
    bloodType: { type: String, enum: BLOOD_TYPES, required: true },
    units: { type: Number, required: true, min: 1 },
    badge: { type: String, default: "Verified Donor" },
  },
  { _id: false }
);

const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },

    // Aadhaar is never stored in plain text. We store a deterministic
    // HMAC-SHA256 hash (keyed with a server-only secret) so a hospital can
    // still look a donor up by typing the Aadhaar number again, but the
    // real number can't be recovered from the database if it's ever exposed.
    aadhaarHash: { type: String, required: true, unique: true, select: false },
    isAadhaarVerified: { type: Boolean, default: false },

    bloodType: { type: String, enum: BLOOD_TYPES, required: true },

    // GeoJSON point — required for $near / $geoWithin queries
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    city: { type: String, trim: true },

    lastDonationDate: { type: Date, default: null },
    isAvailable: { type: Boolean, default: true },

    role: { type: String, default: "donor", immutable: true },
    tokenVersion: { type: Number, default: 0 },

    totalDonations: { type: Number, default: 0 },

    // Priority-donor feature: every hospital-confirmed donation adds a
    // record here and flips isPriorityDonor on, so hospitals can instantly
    // see this person has a verified donation history if they ever need
    // blood themselves.
    donationHistory: { type: [donationHistorySchema], default: [] },
    isPriorityDonor: { type: Boolean, default: false },
    priorityScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

donorSchema.index({ location: "2dsphere" });
donorSchema.index({ bloodType: 1, isAvailable: 1 });

donorSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

donorSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Deterministic Aadhaar hash — same input always produces the same output,
// which is what lets us search for it later, unlike bcrypt's salted hashes.
donorSchema.statics.hashAadhaar = function hashAadhaar(plainAadhaar) {
  const secret = process.env.AADHAAR_HASH_SECRET;
  if (!secret) throw new Error("AADHAAR_HASH_SECRET is not set in .env");
  const normalized = String(plainAadhaar).replace(/\s+/g, ""); // strip spaces: "1234 5678 9012" -> "123456789012"
  return crypto.createHmac("sha256", secret).update(normalized).digest("hex");
};

donorSchema.statics.findByAadhaar = function findByAadhaar(plainAadhaar) {
  const hash = this.hashAadhaar(plainAadhaar);
  return this.findOne({ aadhaarHash: hash });
};

// A donor is eligible again 90 days after their last donation.
donorSchema.methods.isEligible = function isEligible() {
  if (!this.lastDonationDate) return true;
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  return Date.now() - this.lastDonationDate.getTime() >= ninetyDaysMs;
};

donorSchema.methods.nextEligibleDate = function nextEligibleDate() {
  if (!this.lastDonationDate) return null;
  return new Date(this.lastDonationDate.getTime() + 90 * 24 * 60 * 60 * 1000);
};

export const BLOOD_TYPE_LIST = BLOOD_TYPES;
export default mongoose.model("Donor", donorSchema);