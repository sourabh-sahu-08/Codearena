import Hackathon from "../models/Hackathon.js";

export async function listHackathons(req, res) {
  const items = await Hackathon.find({ isPublished: true }).sort({ createdAt: -1 });
  res.json(items);
}

export async function getHackathon(req, res) {
  const item = await Hackathon.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
}

export async function createHackathon(req, res) {
  const data = req.body;
  const created = await Hackathon.create({ ...data, createdBy: req.user._id });
  res.json(created);
}

export async function updateHackathon(req, res) {
  const updated = await Hackathon.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    { $set: req.body },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Not found / not allowed" });
  res.json(updated);
}