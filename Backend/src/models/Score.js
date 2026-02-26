import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    judgeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    innovation: { type: Number, min: 0, max: 10, required: true },
    ux: { type: Number, min: 0, max: 10, required: true },
    complexity: { type: Number, min: 0, max: 10, required: true },
    presentation: { type: Number, min: 0, max: 10, required: true },

    note: { type: String, default: "" },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

scoreSchema.index({ submissionId: 1, judgeId: 1 }, { unique: true });

export default mongoose.model("Score", scoreSchema);