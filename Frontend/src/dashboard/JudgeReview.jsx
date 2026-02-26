import React, { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { api } from "../api/axios";
import { useSocket } from "../hooks/useSocket";

export default function JudgeReview() {
  const [params] = useSearchParams();
  const hackathonId = params.get("hackathonId");
  const submissionId = params.get("submissionId");

  const socket = useSocket({ hackathonId, teamId: null });

  const [sub, setSub] = useState(null);
  const [form, setForm] = useState({
    innovation: 7,
    ux: 7,
    complexity: 7,
    presentation: 7,
    note: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!hackathonId || !submissionId) return;
    // no single-sub endpoint, so load from list
    api.get(`/hackathons/${hackathonId}/submissions/all`)
      .then((r) => setSub(r.data.find(x => x._id === submissionId) || null))
      .catch(console.error);
  }, [hackathonId, submissionId]);

  if (!hackathonId || !submissionId) return <Navigate to="/judge" replace />;

  async function submitScore() {
    setMsg("");
    await api.post(`/hackathons/${hackathonId}/judge/score/${submissionId}`, form);
    setMsg("Scored ✅ Leaderboard will refresh.");
    socket.emit("leaderboard:refresh", { hackathonId });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Review Submission</h1>

        {!sub ? (
          <div className="mt-4 text-slate-600">Loading submission...</div>
        ) : (
          <>
            <div className="mt-4 rounded-xl border bg-slate-50 p-4">
              <div className="text-sm text-slate-600">Team</div>
              <div className="text-lg font-bold">{sub.teamId?.name || "-"}</div>
              <div className="mt-2 text-sm">
                <a className="text-indigo-600 font-semibold" href={sub.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
                {sub.demoVideoUrl ? (
                  <>
                    <span className="mx-2 text-slate-400">•</span>
                    <a className="text-indigo-600 font-semibold" href={sub.demoVideoUrl} target="_blank" rel="noreferrer">Demo</a>
                  </>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <Score label="Innovation (0-10)" value={form.innovation} onChange={(v) => setForm(p => ({...p, innovation: v}))} />
              <Score label="UI/UX (0-10)" value={form.ux} onChange={(v) => setForm(p => ({...p, ux: v}))} />
              <Score label="Complexity (0-10)" value={form.complexity} onChange={(v) => setForm(p => ({...p, complexity: v}))} />
              <Score label="Presentation (0-10)" value={form.presentation} onChange={(v) => setForm(p => ({...p, presentation: v}))} />
            </div>

            <label className="block mt-4">
              <div className="text-sm font-semibold">Note</div>
              <textarea
                className="mt-1 w-full px-4 py-2.5 rounded-xl border min-h-[110px]"
                value={form.note}
                onChange={(e) => setForm(p => ({...p, note: e.target.value}))}
                placeholder="Feedback for team..."
              />
            </label>

            <button
              onClick={submitScore}
              className="mt-5 w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold"
            >
              Submit Score
            </button>

            {msg && <div className="mt-4 p-3 rounded-xl bg-emerald-50 border text-emerald-800 text-sm">{msg}</div>}
          </>
        )}
      </div>
    </div>
  );
}

function Score({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold">{label}</div>
      <input
        type="number"
        min="0"
        max="10"
        className="mt-1 w-full px-4 py-2.5 rounded-xl border"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}