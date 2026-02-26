import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    name: { type: String, required: true, trim: true },
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxSize: { type: Number, default: 4 },
    inviteCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);