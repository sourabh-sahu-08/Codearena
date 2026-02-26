import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { myTeam, createTeam, joinTeam } from "../controllers/team.controller.js";

const r = Router({ mergeParams: true });
r.get("/mine", requireAuth, myTeam);
r.post("/create", requireAuth, createTeam);
r.post("/join", requireAuth, joinTeam);
export default r;