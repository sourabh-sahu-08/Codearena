import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listHackathons, getHackathon, createHackathon, updateHackathon } from "../controllers/hackathon.controller.js";

const r = Router();
r.get("/", listHackathons);
r.get("/:id", getHackathon);

r.post("/", requireAuth, requireRole("ORGANIZER"), createHackathon);
r.patch("/:id", requireAuth, requireRole("ORGANIZER"), updateHackathon);

export default r;