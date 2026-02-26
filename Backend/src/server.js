import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import Message from "./models/Message.js";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: env.CLIENT_URL, credentials: true },
});

io.on("connection", (socket) => {
  socket.on("join", ({ hackathonId, teamId }) => {
    if (hackathonId) socket.join(`hack:${hackathonId}`);
    if (teamId) socket.join(`team:${teamId}`);
  });

  socket.on("chat:send", async ({ hackathonId, teamId = null, senderId, text }) => {
    const msg = await Message.create({ hackathonId, teamId, senderId, text });
    const room = teamId ? `team:${teamId}` : `hack:${hackathonId}`;
    io.to(room).emit("chat:new", msg);
  });

  socket.on("leaderboard:refresh", ({ hackathonId }) => {
    io.to(`hack:${hackathonId}`).emit("leaderboard:refresh");
  });
});

await connectDB(env.MONGO_URI);
server.listen(env.PORT, () => console.log(`✅ API running on http://localhost:${env.PORT}`));