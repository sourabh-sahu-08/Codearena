import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export function useSocket({ hackathonId, teamId }) {
  const socketUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : "http://localhost:8080";
  const socket = useMemo(() => io(socketUrl), []);

  useEffect(() => {
    socket.emit("join", { hackathonId, teamId });
    return () => socket.disconnect();
  }, [socket, hackathonId, teamId]);

  return socket;
}