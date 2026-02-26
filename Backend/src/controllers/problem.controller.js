import Problem from "../models/Problem.js";

export async function listProblems(req, res) {
  const { hackathonId } = req.params;
  const items = await Problem.find({ hackathonId }).sort({ createdAt: -1 });
  res.json(items);
}

export async function addProblem(req, res) {
  const { hackathonId } = req.params;
  const created = await Problem.create({ ...req.body, hackathonId });
  res.json(created);
}