import Submission from "../models/Submission.js";
import Team from "../models/Team.js";
import { normalizeGithub } from "../utils/validators.js";

export async function submitProject(req, res) {
  const { hackathonId } = req.params;
  const { githubUrl, demoVideoUrl, pptUrl, docUrl, problemId } = req.body;

  const team = await Team.findOne({ hackathonId, members: req.user._id });
  if (!team) return res.status(400).json({ message: "Create/join a team first" });

  const githubFingerprint = normalizeGithub(githubUrl);

  // Unique index handles duplicates per hackathon
  const created = await Submission.create({
    hackathonId,
    teamId: team._id,
    problemId: problemId || null,
    githubUrl,
    demoVideoUrl: demoVideoUrl || "",
    pptUrl: pptUrl || "",
    docUrl: docUrl || "",
    githubFingerprint,
  });

  res.json(created);
}

export async function mySubmission(req, res) {
  const { hackathonId } = req.params;
  const team = await Team.findOne({ hackathonId, members: req.user._id });
  if (!team) return res.json(null);

  const s = await Submission.findOne({ hackathonId, teamId: team._id });
  res.json(s);
}

export async function listSubmissionsForJudge(req, res) {
  const { hackathonId } = req.params;
  const list = await Submission.find({ hackathonId }).populate("teamId", "name");
  res.json(list);
}