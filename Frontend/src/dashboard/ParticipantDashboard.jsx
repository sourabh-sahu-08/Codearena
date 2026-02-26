import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../api/axios";
import { Link, Navigate } from "react-router-dom";

export default function ParticipantDashboard() {
  const { user } = useContext(AuthContext);
  const [hackathons, setHackathons] = useState([]);

  useEffect(() => {
    api.get("/hackathons").then((r) => setHackathons(r.data)).catch(console.error);
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  // redirect based on role
  if (user.role === "ORGANIZER") return <Navigate to="/organizer" replace />;
  if (user.role === "JUDGE") return <Navigate to="/judge" replace />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-xs text-slate-500">Dashboard</div>
        <h1 className="text-3xl font-black text-slate-900 mt-1">
          Welcome, {user.name}
        </h1>
        <p className="text-slate-600 mt-2">
          Pick a hackathon, create/join team and submit your project.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold" to="/hackathons">
            Browse Hackathons
          </Link>
          <Link className="px-4 py-2.5 rounded-xl border bg-white font-semibold" to="/leaderboard">
            Leaderboard
          </Link>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {hackathons.slice(0, 6).map((h) => (
          <Link key={h._id} to={`/hackathons/${h._id}`} className="rounded-2xl border bg-white p-5 hover:shadow-md transition">
            <div className="text-xs text-slate-500">{h.mode}</div>
            <div className="font-bold text-slate-900 mt-1">{h.title}</div>
            <div className="text-sm text-slate-600 mt-1 line-clamp-2">{h.tagline}</div>
            <div className="mt-3 text-xs text-slate-600">
              Submission: <b>{new Date(h.submissionDeadline).toLocaleDateString()}</b>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}