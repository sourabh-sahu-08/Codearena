import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export function useSocket({ hackathonId, teamId }) {
  const socket = useMemo(() => io("http://localhost:8080"), []);

  useEffect(() => {
    socket.emit("join", { hackathonId, teamId });
    return () => socket.disconnect();
  }, [socket, hackathonId, teamId]);

  return socket;
}