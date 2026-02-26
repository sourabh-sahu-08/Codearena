import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    tagline: { type: String, default: "" },
    mode: { type: String, enum: ["ONLINE", "OFFLINE", "HYBRID"], default: "ONLINE" },
    city: { type: String, default: "" },
    domains: [{ type: String }],
    prizePool: { type: Number, default: 0 },

    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    submissionDeadline: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Hackathon", hackathonSchema);