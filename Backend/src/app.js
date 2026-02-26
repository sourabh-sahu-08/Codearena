import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import hackRoutes from "./routes/hackathon.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import teamRoutes from "./routes/team.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import judgeRoutes from "./routes/judge.routes.js";
import certRoutes from "./routes/cert.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.get("/", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/hackathons", hackRoutes);

  // nested
  app.use("/api/hackathons/:hackathonId/problems", problemRoutes);
  app.use("/api/hackathons/:hackathonId/teams", teamRoutes);
  app.use("/api/hackathons/:hackathonId/submissions", submissionRoutes);
  app.use("/api/hackathons/:hackathonId/judge", judgeRoutes);
  app.use("/api/hackathons/:hackathonId/cert", certRoutes);

  return app;
}