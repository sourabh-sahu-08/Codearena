import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useSocket } from "../hooks/useSocket";

export default function Leaderboard() {
  const [hackathons, setHackathons] = useState([]);
  const [hackathonId, setHackathonId] = useState("");
  const [rows, setRows] = useState([]);

  const socket = useSocket({ hackathonId, teamId: null });

  useEffect(() => {
    api.get("/hackathons").then((r) => {
      setHackathons(r.data);
      if (r.data[0]?._id) setHackathonId(r.data[0]._id);
    });
  }, []);

  async function load() {
    if (!hackathonId) return;
    const r = await api.get(`/hackathons/${hackathonId}/judge/leaderboard`);
    setRows(r.data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, [hackathonId]);

  useEffect(() => {
    socket.on("leaderboard:refresh", () => load().catch(console.error));
    return () => socket.off("leaderboard:refresh");
  }, [socket, hackathonId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Leaderboard</h1>
          <p className="text-slate-600 mt-1">Average scores by judges.</p>
        </div>

        <div className="flex gap-2">
          <select
            className="px-4 py-2.5 rounded-xl border bg-white"
            value={hackathonId}
            onChange={(e) => setHackathonId(e.target.value)}
          >
            {hackathons.map((h) => (
              <option key={h._id} value={h._id}>{h.title}</option>
            ))}
          </select>

          <button
            onClick={load}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-3">Rank</th>
              <th className="text-left p-3">Team</th>
              <th className="text-left p-3">Avg Score</th>
              <th className="text-left p-3">Judges</th>
              <th className="text-left p-3">Links</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.submissionId} className="border-b last:border-0">
                <td className="p-3 font-bold">#{r.rank}</td>
                <td className="p-3">{r.team?.name || "-"}</td>
                <td className="p-3 font-semibold">{Number(r.avgTotal).toFixed(2)}</td>
                <td className="p-3">{r.judgeCount}</td>
                <td className="p-3">
                  <a className="text-indigo-600 font-semibold" href={r.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
                  {r.demoVideoUrl ? (
                    <>
                      <span className="mx-2 text-slate-400">•</span>
                      <a className="text-indigo-600 font-semibold" href={r.demoVideoUrl} target="_blank" rel="noreferrer">Demo</a>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-4 text-slate-600" colSpan="5">
                  No scores yet. Judges need to score submissions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}