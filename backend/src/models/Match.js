import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },

    // notified -> accepted -> completed (hospital confirms the donation
    // actually happened) or declined. "completed" is the new state —
    // it's the hospital's confirmation, not the donor's self-report.
    status: {
      type: String,
      enum: ["notified", "accepted", "declined", "expired", "completed"],
      default: "notified",
    },

    distanceKm: { type: Number },
    respondedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

matchSchema.index({ request: 1, donor: 1 }, { unique: true });

export default mongoose.model("Match", matchSchema);