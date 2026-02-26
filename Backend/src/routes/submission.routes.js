import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { submitProject, mySubmission, listSubmissionsForJudge } from "../controllers/submission.controller.js";

const r = Router({ mergeParams: true });
r.get("/mine", requireAuth, mySubmission);
r.post("/", requireAuth, submitProject);
r.get("/all", requireAuth, requireRole("JUDGE", "ORGANIZER"), listSubmissionsForJudge);
export default r;