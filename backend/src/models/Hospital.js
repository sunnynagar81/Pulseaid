import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },

    registrationNumber: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },

    address: { type: String, trim: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    city: { type: String, trim: true },

    role: { type: String, default: "hospital", immutable: true },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hospitalSchema.index({ location: "2dsphere" });

hospitalSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

hospitalSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("Hospital", hospitalSchema);