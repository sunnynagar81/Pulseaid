import mongoose from "mongoose";
import { BLOOD_TYPE_LIST } from "./Donor.js";

const bloodRequestSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },

    patientInfo: { type: String, trim: true },
    bloodType: { type: String, enum: BLOOD_TYPE_LIST, required: true },
    unitsNeeded: { type: Number, required: true, min: 1 },

    urgency: {
      type: String,
      enum: ["critical", "urgent", "scheduled"],
      default: "urgent",
    },

    // Snapshot of the hospital's location at request time, so matching
    // still works even if the hospital record changes later.
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },

    status: {
      type: String,
      enum: ["open", "partially_fulfilled", "fulfilled", "expired", "cancelled"],
      default: "open",
    },

    unitsConfirmed: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

bloodRequestSchema.index({ location: "2dsphere" });
bloodRequestSchema.index({ status: 1, bloodType: 1 });

export default mongoose.model("BloodRequest", bloodRequestSchema);