import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { downloadCertificate } from "../controllers/cert.controller.js";

const r = Router({ mergeParams: true });
r.get("/download", requireAuth, downloadCertificate);
export default r;