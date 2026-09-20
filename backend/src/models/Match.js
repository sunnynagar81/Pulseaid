import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },

    status: {
      type: String,
      enum: ["notified", "accepted", "declined", "expired"],
      default: "notified",
    },

    distanceKm: { type: Number }, // computed at match-creation time
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

// A donor should only have one active match per request.
matchSchema.index({ request: 1, donor: 1 }, { unique: true });

export default mongoose.model("Match", matchSchema);