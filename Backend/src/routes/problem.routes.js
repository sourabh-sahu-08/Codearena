import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listProblems, addProblem } from "../controllers/problem.controller.js";

const r = Router({ mergeParams: true });
r.get("/", listProblems);
r.post("/", requireAuth, requireRole("ORGANIZER"), addProblem);
export default r;