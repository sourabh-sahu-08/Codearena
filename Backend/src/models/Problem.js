import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    title: { type: String, required: true },
    category: { type: String, default: "" },
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM" },
    statement: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Problem", problemSchema);