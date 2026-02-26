import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },

    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    githubUrl: { type: String, required: true, trim: true },
    demoVideoUrl: { type: String, default: "" },
    pptUrl: { type: String, default: "" },
    docUrl: { type: String, default: "" },

    status: { type: String, enum: ["SUBMITTED", "UNDER_REVIEW", "SCORED"], default: "SUBMITTED" },

    // Anti-cheat basics:
    githubFingerprint: { type: String, index: true }, // normalized github url
  },
  { timestamps: true }
);

submissionSchema.index({ hackathonId: 1, githubFingerprint: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);