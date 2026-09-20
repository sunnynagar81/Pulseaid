import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },

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