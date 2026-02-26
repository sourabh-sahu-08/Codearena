import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { scoreSubmission, leaderboard } from "../controllers/judge.controller.js";

const r = Router({ mergeParams: true });
r.post("/score/:submissionId", requireAuth, requireRole("JUDGE"), scoreSubmission);
r.get("/leaderboard", leaderboard);
export default r;