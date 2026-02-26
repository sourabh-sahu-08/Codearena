import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["PARTICIPANT", "ORGANIZER", "JUDGE", "MENTOR"],
      default: "PARTICIPANT",
    },
    skills: [{ type: String }],
    college: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);