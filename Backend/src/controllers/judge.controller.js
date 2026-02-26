import Score from "../models/Score.js";
import Submission from "../models/Submission.js";

export async function scoreSubmission(req, res) {
  const { hackathonId, submissionId } = req.params;
  const { innovation, ux, complexity, presentation, note } = req.body;

  const total = Number(innovation) + Number(ux) + Number(complexity) + Number(presentation);

  const score = await Score.findOneAndUpdate(
    { hackathonId, submissionId, judgeId: req.user._id },
    { innovation, ux, complexity, presentation, note: note || "", total },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await Submission.findByIdAndUpdate(submissionId, { $set: { status: "SCORED" } });

  res.json(score);
}

export async function leaderboard(req, res) {
  const { hackathonId } = req.params;

  // aggregate avg totals by submission
  const rows = await Score.aggregate([
    { $match: { hackathonId: (await import("mongoose")).default.Types.ObjectId(hackathonId) } },
    {
      $group: {
        _id: "$submissionId",
        avgTotal: { $avg: "$total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { avgTotal: -1 } },
    { $limit: 50 },
  ]);

  const submissionIds = rows.map(r => r._id);
  const subs = await Submission.find({ _id: { $in: submissionIds } })
    .populate("teamId", "name")
    .select("teamId githubUrl demoVideoUrl");

  const byId = new Map(subs.map(s => [String(s._id), s]));
  const out = rows.map((r, idx) => ({
    rank: idx + 1,
    submissionId: r._id,
    avgTotal: r.avgTotal,
    judgeCount: r.count,
    team: byId.get(String(r._id))?.teamId || null,
    githubUrl: byId.get(String(r._id))?.githubUrl || "",
    demoVideoUrl: byId.get(String(r._id))?.demoVideoUrl || "",
  }));

  res.json(out);
}