import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../api/axios";
import { Link, Navigate } from "react-router-dom";

export default function JudgeDashboard() {
  const { user } = useContext(AuthContext);
  const [hackathons, setHackathons] = useState([]);
  const [hackathonId, setHackathonId] = useState("");
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    api.get("/hackathons").then((r) => {
      setHackathons(r.data);
      if (r.data[0]?._id) setHackathonId(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!hackathonId) return;
    api.get(`/hackathons/${hackathonId}/submissions/all`)
      .then((r) => setSubs(r.data))
      .catch(console.error);
  }, [hackathonId]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "JUDGE") return <Navigate to="/dashboard" replace />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">Judge</div>
          <h1 className="text-3xl font-black text-slate-900">Judge Dashboard</h1>
          <p className="text-slate-600 mt-1">Review and score submissions.</p>
        </div>

        <select
          className="px-4 py-2.5 rounded-xl border bg-white"
          value={hackathonId}
          onChange={(e) => setHackathonId(e.target.value)}
        >
          {hackathons.map((h) => (
            <option key={h._id} value={h._id}>{h.title}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-3">Team</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Links</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s._id} className="border-b last:border-0">
                <td className="p-3 font-semibold">{s.teamId?.name || "-"}</td>
                <td className="p-3">
                  <span className="text-xs px-2 py-1 rounded-full border bg-slate-50">{s.status}</span>
                </td>
                <td className="p-3">
                  <a className="text-indigo-600 font-semibold" href={s.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
                  {s.demoVideoUrl ? (
                    <>
                      <span className="mx-2 text-slate-400">•</span>
                      <a className="text-indigo-600 font-semibold" href={s.demoVideoUrl} target="_blank" rel="noreferrer">Demo</a>
                    </>
                  ) : null}
                </td>
                <td className="p-3">
                  <Link
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold"
                    to={`/judge-review?hackathonId=${hackathonId}&submissionId=${s._id}`}
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {!subs.length && (
              <tr>
                <td className="p-4 text-slate-600" colSpan="4">No submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-slate-600">
        After scoring, leaderboard auto refreshes when participants submit or you score.
      </div>
    </div>
  );
}