import Team from "../models/Team.js";
import { v4 as uuid } from "uuid";

export async function myTeam(req, res) {
  const { hackathonId } = req.params;
  const team = await Team.findOne({
    hackathonId,
    members: req.user._id,
  }).populate("members", "name email role");
  res.json(team);
}

export async function createTeam(req, res) {
  const { hackathonId } = req.params;
  const { name, maxSize } = req.body;

  const existing = await Team.findOne({ hackathonId, members: req.user._id });
  if (existing) return res.status(409).json({ message: "You are already in a team" });

  const team = await Team.create({
    hackathonId,
    name,
    leaderId: req.user._id,
    members: [req.user._id],
    maxSize: maxSize || 4,
    inviteCode: uuid().slice(0, 8),
  });

  res.json(team);
}

export async function joinTeam(req, res) {
  const { hackathonId } = req.params;
  const { inviteCode } = req.body;

  const team = await Team.findOne({ hackathonId, inviteCode });
  if (!team) return res.status(404).json({ message: "Invalid invite code" });

  if (team.members.length >= team.maxSize)
    return res.status(400).json({ message: "Team is full" });

  const already = await Team.findOne({ hackathonId, members: req.user._id });
  if (already) return res.status(409).json({ message: "You are already in a team" });

  team.members.push(req.user._id);
  await team.save();
  res.json(team);
}